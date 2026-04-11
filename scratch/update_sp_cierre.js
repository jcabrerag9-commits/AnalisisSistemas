const db = require('../server/db.js');
const oracledb = require('../server/node_modules/oracledb');

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection(db.dbConfig);
        const sql = `create or replace PROCEDURE SP_CIERRE_EJERCICIO_ANUAL (
    p_anio               IN NUMBER,
    p_cuenta_utilidad_id IN NUMBER,
    p_usuario_id         IN NUMBER, -- Necesario por el NOT NULL de CON_ASIENTO
    p_moneda_id          IN NUMBER  -- Necesario por el NOT NULL de CON_ASIENTO_DETALLE
) IS
    v_count_abiertos    NUMBER;
    v_periodo_mes_12    NUMBER;
    v_estado_validado   NUMBER;
    v_tipo_cierre       NUMBER;
    v_nuevo_asiento_id  NUMBER;
    v_total_debe        NUMBER(18,2) := 0;
    v_total_haber       NUMBER(18,2) := 0;
    v_diferencia        NUMBER(18,2);

    -- Cursor para sumarizar los saldos de ingresos y gastos de todo el año
    CURSOR c_saldos IS
        SELECT d.CUE_CUENTA, 
               SUM(d.ASD_DEBE_LOCAL) AS total_debe, 
               SUM(d.ASD_HABER_LOCAL) AS total_haber
        FROM CON_ASIENTO_DETALLE d
        JOIN CON_ASIENTO a ON d.ASI_ASIENTO = a.ASI_ASIENTO
        JOIN CON_PERIODO p ON a.PER_PERIODO = p.PER_PERIODO
        JOIN CON_CUENTA c ON d.CUE_CUENTA = c.CUE_CUENTA
        JOIN CON_TIPO_CUENTA t ON c.TCU_TIPO_CUENTA = t.TCU_TIPO_CUENTA
        WHERE p.PER_AÑO = p_anio
          AND t.TCU_NOMBRE IN ('INGRESO', 'GASTO')
          AND a.ESA_ESTADO_ASIENTO = (SELECT ESA_ESTADO_ASIENTO FROM CON_ESTADO_ASIENTO WHERE UPPER(ESA_NOMBRE) = 'VALIDADO')
        GROUP BY d.CUE_CUENTA
        HAVING SUM(d.ASD_DEBE_LOCAL) <> SUM(d.ASD_HABER_LOCAL);

BEGIN
    -- 1. Validar que los 12 meses estén cerrados
    SELECT COUNT(*) INTO v_count_abiertos 
    FROM CON_PERIODO 
    WHERE PER_AÑO = p_anio 
      AND ESP_ESTADO_PERIODO = (SELECT ESP_ESTADO_PERIODO FROM CON_ESTADO_PERIODO WHERE UPPER(ESP_NOMBRE) = 'ABIERTO');

    IF v_count_abiertos > 0 THEN
        RAISE_APPLICATION_ERROR(-20020, 'Fallo en Cierre Anual: Aún existen periodos abiertos en el año ' || p_anio);
    END IF;

    -- 2. Obtener el ID del periodo del mes 12 y parámetros requeridos
    BEGIN
        SELECT PER_PERIODO INTO v_periodo_mes_12 FROM CON_PERIODO WHERE PER_AÑO = p_anio AND PER_MES = 12;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20023, 'Fallo en Cierre Anual: No se encontró el periodo del mes 12 (' || p_anio || '). Verifique que esté creado en CON_PERIODO.');
    END;

    BEGIN
        SELECT ESA_ESTADO_ASIENTO INTO v_estado_validado FROM CON_ESTADO_ASIENTO WHERE UPPER(ESA_NOMBRE) = 'VALIDADO';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20024, 'No existe un estado de asiento con nombre VALIDADO en la tabla CON_ESTADO_ASIENTO.');
    END;

    -- Manejo de excepción en caso no exista el tipo 'CIERRE'
    BEGIN
        SELECT TPA_TIPO_ASIENTO INTO v_tipo_cierre FROM CON_TIPO_ASIENTO WHERE UPPER(TPA_CODIGO) = 'CIERRE';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20021, 'No existe un tipo de asiento con código CIERRE en la tabla CON_TIPO_ASIENTO.');
    END;

    -- 3. Crear Cabecera del Asiento de Cierre
    INSERT INTO CON_ASIENTO (
        PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA
    ) VALUES (
        v_periodo_mes_12, v_tipo_cierre, v_estado_validado, p_usuario_id, LAST_DAY(TO_DATE(p_anio||'-12-01', 'YYYY-MM-DD')), 'Cierre de Ejercicio Anual ' || p_anio
    ) RETURNING ASI_ASIENTO INTO v_nuevo_asiento_id;

    -- 4. Invertir cuentas de Resultados para dejarlas a cero
    FOR r IN c_saldos LOOP
        v_diferencia := r.total_debe - r.total_haber;

        IF v_diferencia > 0 THEN
            -- Saldo deudor (ej. Gasto), para cerrarlo insertamos en el HABER
            INSERT INTO CON_ASIENTO_DETALLE (ASI_ASIENTO, CUE_CUENTA, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_LOCAL, ASD_HABER_LOCAL)
            VALUES (v_nuevo_asiento_id, r.CUE_CUENTA, p_moneda_id, 1, 0, v_diferencia);

            v_total_haber := v_total_haber + v_diferencia;
        ELSIF v_diferencia < 0 THEN
            -- Saldo acreedor (ej. Ingreso), para cerrarlo insertamos en el DEBE
            INSERT INTO CON_ASIENTO_DETALLE (ASI_ASIENTO, CUE_CUENTA, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_LOCAL, ASD_HABER_LOCAL)
            VALUES (v_nuevo_asiento_id, r.CUE_CUENTA, p_moneda_id, 1, ABS(v_diferencia), 0);

            v_total_debe := v_total_debe + ABS(v_diferencia);
        END IF;
    END LOOP;

    -- 5. Calcular la Utilidad o Pérdida y registrar contra la cuenta de Patrimonio
    v_diferencia := v_total_debe - v_total_haber;

    IF v_diferencia > 0 THEN
        -- Si Debe > Haber, falta Haber para cuadrar (Pérdida/Utilidad en Patrimonio)
        INSERT INTO CON_ASIENTO_DETALLE (ASI_ASIENTO, CUE_CUENTA, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_LOCAL, ASD_HABER_LOCAL)
        VALUES (v_nuevo_asiento_id, p_cuenta_utilidad_id, p_moneda_id, 1, 0, v_diferencia);
        v_total_haber := v_total_haber + v_diferencia;
    ELSIF v_diferencia < 0 THEN
        -- Si Haber > Debe, falta Debe para cuadrar
        INSERT INTO CON_ASIENTO_DETALLE (ASI_ASIENTO, CUE_CUENTA, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_LOCAL, ASD_HABER_LOCAL)
        VALUES (v_nuevo_asiento_id, p_cuenta_utilidad_id, p_moneda_id, 1, ABS(v_diferencia), 0);
        v_total_debe := v_total_debe + ABS(v_diferencia);
    END IF;

    -- 6. Validación Final Estricta de Cuadre
    IF v_total_debe <> v_total_haber THEN
        RAISE_APPLICATION_ERROR(-20022, 'Error crítico de redondeo o cálculo. El asiento de cierre no cuadra. Debe: ' || v_total_debe || ' Haber: ' || v_total_haber);
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_CIERRE_EJERCICIO_ANUAL;`;
        
        await connection.execute(sql);
        console.log("SP_CIERRE_EJERCICIO_ANUAL actualizado exitosamente con excepciones controladas.");
    } catch(e) {
        console.error("Error actualizando el SP", e);
    } finally {
        if (connection) await connection.close();
        process.exit(0);
    }
}
run();

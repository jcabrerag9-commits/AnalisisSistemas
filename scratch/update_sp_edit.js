const db = require('../server/db.js');
const oracledb = require('../server/node_modules/oracledb');

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection(db.dbConfig);
        const sql = `create or replace PROCEDURE SP_EDITAR_ASIENTO(
    p_asi_asiento IN NUMBER,
    p_per_periodo IN NUMBER,
    p_tpa_tipo_asiento IN NUMBER,
    p_esa_estado_asiento in Number,
    p_usu_usuario IN NUMBER,
    p_asi_fecha IN DATE,
    p_asi_glosa IN VARCHAR2,
    p_detalles_json IN CLOB
) AS
    v_estado_periodo NUMBER;
    v_total_debe_local NUMBER(18,2);
    v_total_haber_local NUMBER(18,2);
BEGIN
    -- 1. Validación de Periodo (Si está cerrado, no pasa)
    SELECT ESP_ESTADO_PERIODO INTO v_estado_periodo 
    FROM CON_PERIODO 
    WHERE PER_PERIODO = p_per_periodo;
    
    IF v_estado_periodo = 2 THEN 
        RAISE_APPLICATION_ERROR(-20006, 'Operación denegada: El libro diario de este periodo ya está cerrado.');
    END IF;

    -- 2. Actualizar el Encabezado
    UPDATE CON_ASIENTO 
    SET PER_PERIODO = p_per_periodo,
        TPA_TIPO_ASIENTO = p_tpa_tipo_asiento,
        USU_USUARIO = p_usu_usuario,
        ASI_FECHA = p_asi_fecha,
        ASI_GLOSA = p_asi_glosa,
        ESA_Estado_Asiento = p_esa_estado_asiento
    WHERE ASI_ASIENTO = p_asi_asiento;

    -- 3. ELIMINACIÓN QUIRÚRGICA: Borrar solo las filas que NO vienen en el JSON
    DELETE FROM CON_ASIENTO_DETALLE 
    WHERE ASI_ASIENTO = p_asi_asiento
    AND ASD_ASIENTO_DETALLE NOT IN (
        SELECT id_detalle FROM JSON_TABLE(p_detalles_json, '$[*]' 
            COLUMNS (id_detalle NUMBER PATH '$.ASD_ASIENTO_DETALLE')
        ) WHERE id_detalle IS NOT NULL
    );

    -- 4. MERGE (UPSERT): Actualizar existentes o Insertar nuevos
    MERGE INTO CON_ASIENTO_DETALLE d
    USING (
        SELECT * FROM JSON_TABLE(p_detalles_json, '$[*]'
            COLUMNS (
                id_detalle NUMBER PATH '$.ASD_ASIENTO_DETALLE',
                cue_cuenta NUMBER PATH '$.CUE_CUENTA',
                ctc_centro_costo NUMBER PATH '$.CTC_CENTRO_COSTO',
                mon_moneda NUMBER PATH '$.MON_MONEDA',
                tasa_cambio NUMBER PATH '$.CTC_TASA_CAMBIO',
                debe_origen NUMBER PATH '$.ASD_DEBE_ORIGEN',
                haber_origen NUMBER PATH '$.ASD_HABER_ORIGEN',
                debe_local NUMBER PATH '$.ASD_DEBE_LOCAL',
                haber_local NUMBER PATH '$.ASD_HABER_LOCAL'
            )
        )
    ) j ON (d.ASD_ASIENTO_DETALLE = j.id_detalle AND d.ASI_ASIENTO = p_asi_asiento)
    WHEN MATCHED THEN
        -- Si el ID viene en el JSON y existe en la tabla, es un UPDATE
        UPDATE SET 
            CUE_CUENTA = j.cue_cuenta,
            CTC_CENTRO_COSTO = j.ctc_centro_costo,
            MON_MONEDA = j.mon_moneda,
            CTC_TASA_CAMBIO = j.tasa_cambio,
            ASD_DEBE_ORIGEN = j.debe_origen,
            ASD_HABER_ORIGEN = j.haber_origen,
            ASD_DEBE_LOCAL = j.debe_local,
            ASD_HABER_LOCAL = j.haber_local
    WHEN NOT MATCHED THEN
        -- Si el ID no existe (es null o inventado), es un INSERT de una nueva fila
        INSERT (ASI_ASIENTO, CUE_CUENTA, CTC_CENTRO_COSTO, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN, ASD_DEBE_LOCAL, ASD_HABER_LOCAL)
        VALUES (p_asi_asiento, j.cue_cuenta, j.ctc_centro_costo, j.mon_moneda, j.tasa_cambio, j.debe_origen, j.haber_origen, j.debe_local, j.haber_local);

    -- 5. Validación de Partida Doble Total
    SELECT SUM(ASD_DEBE_LOCAL), SUM(ASD_HABER_LOCAL) 
    INTO v_total_debe_local, v_total_haber_local
    FROM CON_ASIENTO_DETALLE 
    WHERE ASI_ASIENTO = p_asi_asiento;

    IF ABS(v_total_debe_local - v_total_haber_local) > 0.01 THEN
        RAISE_APPLICATION_ERROR(-20005, 'El asiento descuadra tras la edición. Debe: ' || v_total_debe_local || ' Haber: ' || v_total_haber_local);
    END IF;

END;`;
        
        await connection.execute(sql);
        console.log("SP_EDITAR_ASIENTO actualizado exitosamente.");
    } catch(e) {
        console.error("Error actualizando el SP", e);
    } finally {
        if (connection) await connection.close();
        process.exit(0);
    }
}
run();

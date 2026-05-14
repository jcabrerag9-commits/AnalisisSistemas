
const db = require('../db');

exports.getLibroDiario = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio || !mes) {
            return res.status(400).json({ error: 'Los parámetros "anio" y "mes" son obligatorios.' });
        }

        const sql = `
            SELECT 
                EXTRACT(YEAR FROM a.ASI_FECHA) AS ANIO,
                EXTRACT(MONTH FROM a.ASI_FECHA) AS MES,
                a.ASI_FECHA AS FECHA_POLIZA,
                a.ASI_ASIENTO AS NUMERO_POLIZA,
                a.ASI_GLOSA AS DESCRIPCION,
                c.CUE_CODIGO AS CODIGO_CUENTA,
                c.CUE_NOMBRE AS NOMBRE_CUENTA,
                ad.ASD_DEBE_LOCAL AS DEBE,
                ad.ASD_HABER_LOCAL AS HABER
            FROM CON_ASIENTO a
            JOIN CON_ASIENTO_DETALLE ad ON a.ASI_ASIENTO = ad.ASI_ASIENTO
            JOIN CON_CUENTA c ON ad.CUE_CUENTA = c.CUE_CUENTA
            WHERE EXTRACT(YEAR FROM a.ASI_FECHA) = :anio 
              AND EXTRACT(MONTH FROM a.ASI_FECHA) = :mes
            ORDER BY a.ASI_FECHA, a.ASI_ASIENTO
        `;

        const result = await db.executeQuery(sql, { anio: Number(anio), mes: Number(mes) });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAniosDisponibles = async (req, res) => {
    try {
        const sql = `
            SELECT DISTINCT EXTRACT(YEAR FROM ASI_FECHA) AS PER_AÑO
            FROM CON_ASIENTO
            ORDER BY 1 DESC
        `;
        const result = await db.executeQuery(sql);
        const aniosFormateados = result.rows.map(row => ({
            value: String(row.PER_AÑO),
            label: String(row.PER_AÑO)
        }));
        res.json(aniosFormateados);
    } catch (err) {
        console.error('Error fetching anios reportes:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getEstadoResultados = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio || !mes) {
            return res.status(400).json({ error: 'Los parámetros "anio" y "mes" son obligatorios.' });
        }

        const sql = `
            SELECT
                CODIGO_CUENTA,
                NOMBRE_CUENTA,
                TIPO_CUENTA,
                SUM(TOTAL_DEBE)       AS TOTAL_DEBE,
                SUM(TOTAL_HABER)      AS TOTAL_HABER,
                SUM(MONTO_IMPUESTO)   AS MONTO_IMPUESTO,
                CATEGORIA
            FROM (
                SELECT
                    C.CUE_CODIGO                    AS CODIGO_CUENTA,
                    C.CUE_NOMBRE                    AS NOMBRE_CUENTA,
                    TC.TCU_NOMBRE                   AS TIPO_CUENTA,
                    AD.ASD_DEBE_LOCAL               AS TOTAL_DEBE,
                    AD.ASD_HABER_LOCAL              AS TOTAL_HABER,
                    NVL(IM.IMM_MONTO_IMPUESTO, 0)   AS MONTO_IMPUESTO,
                    CASE
                        WHEN UPPER(TC.TCU_NOMBRE) LIKE 'INGRESO%'
                            THEN 'INGRESO'
                        WHEN UPPER(TC.TCU_NOMBRE) LIKE '%DEPRECIA%'
                          OR UPPER(C.CUE_NOMBRE)  LIKE '%DEPRECIA%'
                            THEN 'DEPRECIACION'
                        WHEN UPPER(TC.TCU_NOMBRE) LIKE '%IMPUESTO%'
                          OR UPPER(C.CUE_NOMBRE)  LIKE '%IMPUESTO%'
                          OR UPPER(C.CUE_NOMBRE)  LIKE '%ISR%'
                            THEN 'IMPUESTO'
                        ELSE 'GASTO_OPERATIVO'
                    END AS CATEGORIA
                FROM CON_ASIENTO A
                JOIN CON_ASIENTO_DETALLE AD ON A.ASI_ASIENTO        = AD.ASI_ASIENTO
                JOIN CON_CUENTA          C  ON AD.CUE_CUENTA         = C.CUE_CUENTA
                JOIN CON_TIPO_CUENTA     TC ON C.TCU_TIPO_CUENTA     = TC.TCU_TIPO_CUENTA
                JOIN CON_PERIODO         P  ON A.PER_PERIODO          = P.PER_PERIODO
                JOIN CON_ESTADO_ASIENTO  EA ON A.ESA_ESTADO_ASIENTO   = EA.ESA_ESTADO_ASIENTO
                LEFT JOIN CON_IMPUESTO_MOVIMIENTO IM ON AD.ASD_ASIENTO_DETALLE = IM.ASD_ASIENTO_DETALLE
                WHERE P.PER_AÑO = :anio
                  AND P.PER_MES = :mes
                  AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'
                  AND (
                      UPPER(TC.TCU_NOMBRE) LIKE 'INGRESO%'
                      OR UPPER(TC.TCU_NOMBRE) LIKE 'GASTO%'
                      OR UPPER(TC.TCU_NOMBRE) LIKE 'COSTO%'
                      OR UPPER(TC.TCU_NOMBRE) LIKE '%DEPRECIA%'
                      OR UPPER(TC.TCU_NOMBRE) LIKE '%IMPUESTO%'
                  )
            )
            GROUP BY CODIGO_CUENTA, NOMBRE_CUENTA, TIPO_CUENTA, CATEGORIA
            ORDER BY
                CASE CATEGORIA
                    WHEN 'INGRESO'         THEN 1
                    WHEN 'GASTO_OPERATIVO' THEN 2
                    WHEN 'DEPRECIACION'    THEN 3
                    WHEN 'IMPUESTO'        THEN 4
                    ELSE 5
                END,
                CODIGO_CUENTA
        `;

        const result = await db.executeQuery(sql, { anio: Number(anio), mes: Number(mes) });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

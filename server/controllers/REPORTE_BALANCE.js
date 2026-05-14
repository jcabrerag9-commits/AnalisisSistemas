const db = require('../db');

// GET /api/reportes/balance-general?anio=2026&mes=3 (mes es opcional)
exports.getBalanceGeneral = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio) {
            return res.status(400).json({ error: 'Debe proporcionar el año.' });
        }

        const condicionMes = mes ? 'AND P.PER_MES <= :mes' : '';
        const binds = mes
            ? { anio: parseInt(anio), mes: parseInt(mes) }
            : { anio: parseInt(anio) };

        const SQL = `
            SELECT
                TC.TCU_NOMBRE AS SUBTIPO_CUENTA,
                CASE
                    WHEN UPPER(TC.TCU_NOMBRE) LIKE 'ACTIVO%'    THEN 'ACTIVO'
                    WHEN UPPER(TC.TCU_NOMBRE) LIKE 'PASIVO%'    THEN 'PASIVO'
                    WHEN UPPER(TC.TCU_NOMBRE) LIKE 'CAPITAL%'   THEN 'CAPITAL'
                    WHEN UPPER(TC.TCU_NOMBRE) LIKE 'PATRIMONIO%' THEN 'CAPITAL'
                    ELSE UPPER(TC.TCU_NOMBRE)
                END                       AS GRUPO_PRINCIPAL,
                C.CUE_CODIGO             AS CODIGO_CUENTA,
                C.CUE_NOMBRE             AS NOMBRE_CUENTA,
                SUM(AD.ASD_DEBE_LOCAL)   AS TOTAL_DEBE,
                SUM(AD.ASD_HABER_LOCAL)  AS TOTAL_HABER
            FROM CON_ASIENTO_DETALLE AD
            JOIN CON_ASIENTO        A  ON AD.ASI_ASIENTO      = A.ASI_ASIENTO
            JOIN CON_PERIODO        P  ON A.PER_PERIODO        = P.PER_PERIODO
            JOIN CON_ESTADO_ASIENTO EA ON A.ESA_ESTADO_ASIENTO = EA.ESA_ESTADO_ASIENTO
            JOIN CON_CUENTA         C  ON AD.CUE_CUENTA        = C.CUE_CUENTA
            JOIN CON_TIPO_CUENTA    TC ON C.TCU_TIPO_CUENTA    = TC.TCU_TIPO_CUENTA
            WHERE P.PER_AÑO = :anio
              ${condicionMes}
              AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'
              AND (
                  UPPER(TC.TCU_NOMBRE) LIKE 'ACTIVO%'
                  OR UPPER(TC.TCU_NOMBRE) LIKE 'PASIVO%'
                  OR UPPER(TC.TCU_NOMBRE) LIKE 'CAPITAL%'
                  OR UPPER(TC.TCU_NOMBRE) LIKE 'PATRIMONIO%'
              )
            GROUP BY TC.TCU_NOMBRE, C.CUE_CODIGO, C.CUE_NOMBRE
            ORDER BY
                CASE
                    WHEN UPPER(TC.TCU_NOMBRE) LIKE 'ACTIVO%'    THEN 1
                    WHEN UPPER(TC.TCU_NOMBRE) LIKE 'PASIVO%'    THEN 2
                    ELSE 3
                END,
                TC.TCU_NOMBRE,
                C.CUE_CODIGO
        `;

        const result = await db.executeQuery(SQL, binds);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en getBalanceGeneral:', err);
        res.status(500).json({ error: err.message });
    }
};

const db = require('../db');

// GET /api/reportes/balanza-comprobacion?anio=2026&mes=3
exports.getBalanzaComprobacion = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio) {
            return res.status(400).json({ error: 'Debe proporcionar el año.' });
        }

        const condicionMes = mes ? 'AND P.PER_MES <= :mes' : '';
        const binds = mes
            ? { anio: parseInt(anio), mes: parseInt(mes) }
            : { anio: parseInt(anio) };

        // Balanza de Comprobación:
        // Todas las cuentas con movimiento en el período,
        // sus sumas de Debe y Haber, y el saldo resultante.
        const SQL = `
            SELECT
                TC.TCU_NOMBRE                           AS TIPO_CUENTA,
                C.CUE_CODIGO                            AS CODIGO_CUENTA,
                C.CUE_NOMBRE                            AS NOMBRE_CUENTA,
                SUM(AD.ASD_DEBE_LOCAL)                  AS TOTAL_DEBE,
                SUM(AD.ASD_HABER_LOCAL)                 AS TOTAL_HABER,
                -- Saldo deudor (si Debe > Haber)
                CASE
                    WHEN SUM(AD.ASD_DEBE_LOCAL) > SUM(AD.ASD_HABER_LOCAL)
                    THEN SUM(AD.ASD_DEBE_LOCAL) - SUM(AD.ASD_HABER_LOCAL)
                    ELSE 0
                END AS SALDO_DEUDOR,
                -- Saldo acreedor (si Haber > Debe)
                CASE
                    WHEN SUM(AD.ASD_HABER_LOCAL) > SUM(AD.ASD_DEBE_LOCAL)
                    THEN SUM(AD.ASD_HABER_LOCAL) - SUM(AD.ASD_DEBE_LOCAL)
                    ELSE 0
                END AS SALDO_ACREEDOR
            FROM CON_ASIENTO_DETALLE AD
            JOIN CON_ASIENTO        A   ON AD.ASI_ASIENTO       = A.ASI_ASIENTO
            JOIN CON_PERIODO        P   ON A.PER_PERIODO         = P.PER_PERIODO
            JOIN CON_ESTADO_ASIENTO EA  ON A.ESA_ESTADO_ASIENTO  = EA.ESA_ESTADO_ASIENTO
            JOIN CON_CUENTA         C   ON AD.CUE_CUENTA         = C.CUE_CUENTA
            JOIN CON_TIPO_CUENTA    TC  ON C.TCU_TIPO_CUENTA     = TC.TCU_TIPO_CUENTA
            WHERE P.PER_AÑO = :anio
              ${condicionMes}
              AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'
            GROUP BY TC.TCU_NOMBRE, C.CUE_CODIGO, C.CUE_NOMBRE
            ORDER BY C.CUE_CODIGO
        `;

        const result = await db.executeQuery(SQL, binds);
        res.json(result.rows);

    } catch (err) {
        console.error('Error en getBalanzaComprobacion:', err);
        res.status(500).json({ error: err.message });
    }
};

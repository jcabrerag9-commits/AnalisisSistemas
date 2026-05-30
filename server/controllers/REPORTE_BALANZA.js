const db = require('../db');

// GET /api/reportes/balanza-comprobacion?anio=2026&mes=3
exports.getBalanzaComprobacion = async (req, res) => {
    try {
        const { anio, mes, fechaInicio, fechaFin, centroCostoId, monedaId, estadoAsientoId } = req.query;

        let sql = `
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
            JOIN CON_ESTADO_ASIENTO EA  ON A.ESA_ESTADO_ASIENTO  = EA.ESA_ESTADO_ASIENTO
            JOIN CON_CUENTA         C   ON AD.CUE_CUENTA         = C.CUE_CUENTA
            JOIN CON_TIPO_CUENTA    TC  ON C.TCU_TIPO_CUENTA     = TC.TCU_TIPO_CUENTA
            LEFT JOIN CON_PERIODO   P   ON A.PER_PERIODO         = P.PER_PERIODO
            WHERE 1=1
        `;

        const binds = {};

        // 1. Filtrado por Fecha/Periodo
        if (fechaInicio && fechaFin) {
            sql += ` AND A.ASI_FECHA BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
            binds.fechaInicio = fechaInicio;
            binds.fechaFin = fechaFin;
        } else if (anio) {
            sql += ` AND P.PER_AÑO = :anio`;
            binds.anio = parseInt(anio);
            if (mes) {
                sql += ` AND P.PER_MES <= :mes`;
                binds.mes = parseInt(mes);
            }
        } else {
            return res.status(400).json({ error: 'Debe proporcionar el año o un rango de fechas (fechaInicio y fechaFin).' });
        }

        // 2. Filtro de Centro de Costo
        if (centroCostoId) {
            sql += ` AND AD.CTC_CENTRO_COSTO = :centroCostoId`;
            binds.centroCostoId = Number(centroCostoId);
        }

        // 3. Filtro de Moneda
        if (monedaId) {
            sql += ` AND AD.MON_MONEDA = :monedaId`;
            binds.monedaId = Number(monedaId);
        }

        // 4. Filtro de Estado de Asiento
        if (estadoAsientoId) {
            if (estadoAsientoId !== 'TODOS') {
                sql += ` AND A.ESA_ESTADO_ASIENTO = :estadoAsientoId`;
                binds.estadoAsientoId = Number(estadoAsientoId);
            }
        } else {
            sql += ` AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'`;
        }

        sql += `
            GROUP BY TC.TCU_NOMBRE, C.CUE_CODIGO, C.CUE_NOMBRE
            ORDER BY C.CUE_CODIGO
        `;

        const result = await db.executeQuery(sql, binds);
        res.json(result.rows);

    } catch (err) {
        console.error('Error en getBalanzaComprobacion:', err);
        res.status(500).json({ error: err.message });
    }
};

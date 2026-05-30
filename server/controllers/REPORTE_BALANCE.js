const db = require('../db');

// GET /api/reportes/balance-general?anio=2026&mes=3 (mes es opcional)
exports.getBalanceGeneral = async (req, res) => {
    try {
        const { anio, mes, fechaInicio, fechaFin, centroCostoId, monedaId, estadoAsientoId } = req.query;

        let sql = `
            SELECT
                TC.TCU_NOMBRE                           AS TIPO_CUENTA,
                NVL(CP.CUE_CODIGO, C.CUE_CODIGO)       AS CODIGO_GRUPO,
                NVL(CP.CUE_NOMBRE, C.CUE_NOMBRE)       AS NOMBRE_GRUPO,
                C.CUE_CODIGO                            AS CODIGO_CUENTA,
                C.CUE_NOMBRE                            AS NOMBRE_CUENTA,
                SUM(AD.ASD_DEBE_LOCAL)                  AS TOTAL_DEBE,
                SUM(AD.ASD_HABER_LOCAL)                 AS TOTAL_HABER
            FROM CON_ASIENTO_DETALLE AD
            JOIN CON_ASIENTO        A   ON AD.ASI_ASIENTO      = A.ASI_ASIENTO
            JOIN CON_ESTADO_ASIENTO EA  ON A.ESA_ESTADO_ASIENTO = EA.ESA_ESTADO_ASIENTO
            JOIN CON_CUENTA         C   ON AD.CUE_CUENTA        = C.CUE_CUENTA
            LEFT JOIN CON_CUENTA    CP  ON C.CUE_CUENTA_PADRE   = CP.CUE_CUENTA
            JOIN CON_TIPO_CUENTA    TC  ON C.TCU_TIPO_CUENTA    = TC.TCU_TIPO_CUENTA
            LEFT JOIN CON_PERIODO   P   ON A.PER_PERIODO        = P.PER_PERIODO
            WHERE 1=1
        `;

        const binds = {};

        // 1. Filtrado por Fecha/Periodo (El Balance General es acumulativo hasta la fecha)
        if (fechaFin) {
            sql += ` AND A.ASI_FECHA <= TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
            binds.fechaFin = fechaFin;
        } else if (anio) {
            sql += ` AND P.PER_AÑO = :anio`;
            binds.anio = parseInt(anio);
            if (mes) {
                sql += ` AND P.PER_MES <= :mes`;
                binds.mes = parseInt(mes);
            }
        } else {
            return res.status(400).json({ error: 'Debe proporcionar el año o una fecha límite (fechaFin).' });
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

        sql += ` AND UPPER(TC.TCU_NOMBRE) IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'CAPITAL')`;
        sql += `
            GROUP BY TC.TCU_NOMBRE, CP.CUE_CODIGO, CP.CUE_NOMBRE, C.CUE_CODIGO, C.CUE_NOMBRE
            ORDER BY TC.TCU_NOMBRE, NVL(CP.CUE_CODIGO, C.CUE_CODIGO), C.CUE_CODIGO
        `;

        const result = await db.executeQuery(sql, binds);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en getBalanceGeneral:', err);
        res.status(500).json({ error: err.message });
    }
};

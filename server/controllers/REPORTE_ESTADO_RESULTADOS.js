const db = require('../db');

// GET /api/reportes/estado-resultados?anio=2026&mes=2
exports.getEstadoResultados = async (req, res) => {
    try {
        const { anio, mes, fechaInicio, fechaFin, centroCostoId, monedaId, estadoAsientoId } = req.query;

        let dateCond = '';
        let extraCond = '';
        const binds = {};

        // 1. Filtrado por Fecha/Periodo
        if (fechaInicio && fechaFin) {
            dateCond = ` AND A.ASI_FECHA BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
            binds.fechaInicio = fechaInicio;
            binds.fechaFin = fechaFin;
        } else if (anio && mes) {
            dateCond = ` AND P.PER_AÑO = :anio AND P.PER_MES = :mes`;
            binds.anio = parseInt(anio);
            binds.mes = parseInt(mes);
        } else if (anio) {
            dateCond = ` AND P.PER_AÑO = :anio`;
            binds.anio = parseInt(anio);
        } else {
            return res.status(400).json({ error: 'Debe proporcionar año y mes, o un rango de fechas (fechaInicio y fechaFin).' });
        }

        // 2. Filtro de Centro de Costo
        if (centroCostoId) {
            extraCond += ` AND AD.CTC_CENTRO_COSTO = :centroCostoId`;
            binds.centroCostoId = Number(centroCostoId);
        }

        // 3. Filtro de Moneda
        if (monedaId) {
            extraCond += ` AND AD.MON_MONEDA = :monedaId`;
            binds.monedaId = Number(monedaId);
        }

        // 4. Filtro de Estado de Asiento
        if (estadoAsientoId) {
            if (estadoAsientoId !== 'TODOS') {
                extraCond += ` AND A.ESA_ESTADO_ASIENTO = :estadoAsientoId`;
                binds.estadoAsientoId = Number(estadoAsientoId);
            }
        } else {
            extraCond += ` AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'`;
        }

        // ── 1. Ingresos y Gastos por cuenta ──
        const SQL_CUENTAS = `
            SELECT
                SUBSTR(C.CUE_CODIGO, 1, 1)      AS TIPO,
                TC.TCU_NOMBRE                   AS TIPO_CUENTA,
                C.CUE_CODIGO                    AS CODIGO_CUENTA,
                C.CUE_NOMBRE                    AS NOMBRE_CUENTA,
                SUM(AD.ASD_DEBE_LOCAL)          AS TOTAL_DEBE,
                SUM(AD.ASD_HABER_LOCAL)         AS TOTAL_HABER,
                -- Detecta si la cuenta es de depreciación/amortización
                CASE
                    WHEN UPPER(C.CUE_NOMBRE) LIKE '%DEPRECIA%'
                      OR UPPER(C.CUE_NOMBRE) LIKE '%AMORTIZA%'
                    THEN 'S'
                    ELSE 'N'
                END AS ES_DEPRECIACION
            FROM CON_ASIENTO_DETALLE AD
            JOIN CON_ASIENTO        A   ON AD.ASI_ASIENTO       = A.ASI_ASIENTO
            JOIN CON_ESTADO_ASIENTO EA  ON A.ESA_ESTADO_ASIENTO  = EA.ESA_ESTADO_ASIENTO
            JOIN CON_CUENTA         C   ON AD.CUE_CUENTA         = C.CUE_CUENTA
            JOIN CON_TIPO_CUENTA    TC  ON C.TCU_TIPO_CUENTA     = TC.TCU_TIPO_CUENTA
            LEFT JOIN CON_PERIODO   P   ON A.PER_PERIODO         = P.PER_PERIODO
            WHERE 1=1
              ${dateCond}
              ${extraCond}
              AND UPPER(TC.TCU_NOMBRE) IN ('INGRESO', 'GASTO')
            GROUP BY
                SUBSTR(C.CUE_CODIGO, 1, 1),
                TC.TCU_NOMBRE,
                C.CUE_CODIGO,
                C.CUE_NOMBRE
            ORDER BY C.CUE_CODIGO
        `;

        // ── 2. Movimientos de impuesto (IVA, ISR, etc.) ──
        const SQL_IMPUESTOS = `
            SELECT
                I.IMP_CODIGO                    AS CODIGO_IMPUESTO,
                I.IMP_NOMBRE                    AS NOMBRE_IMPUESTO,
                I.IMP_PORCENTAJE                AS PORCENTAJE,
                IM.IMM_TIPO_AFECTACION          AS TIPO_AFECTACION,
                SUM(IM.IMM_BASE_IMPONIBLE)      AS TOTAL_BASE,
                SUM(IM.IMM_MONTO_IMPUESTO)      AS TOTAL_IMPUESTO
            FROM CON_IMPUESTO_MOVIMIENTO IM
            JOIN CON_IMPUESTO            I   ON IM.IMP_IMPUESTO     = I.IMP_IMPUESTO
            JOIN CON_ASIENTO_DETALLE     AD  ON IM.ASD_ASIENTO_DETALLE = AD.ASD_ASIENTO_DETALLE
            JOIN CON_ASIENTO             A   ON AD.ASI_ASIENTO      = A.ASI_ASIENTO
            JOIN CON_ESTADO_ASIENTO      EA  ON A.ESA_ESTADO_ASIENTO = EA.ESA_ESTADO_ASIENTO
            LEFT JOIN CON_PERIODO        P   ON A.PER_PERIODO        = P.PER_PERIODO
            WHERE 1=1
              ${dateCond}
              ${extraCond}
            GROUP BY
                I.IMP_CODIGO, I.IMP_NOMBRE,
                I.IMP_PORCENTAJE, IM.IMM_TIPO_AFECTACION
            ORDER BY I.IMP_CODIGO
        `;

        const [resCuentas, resImpuestos] = await Promise.all([
            db.executeQuery(SQL_CUENTAS,   binds),
            db.executeQuery(SQL_IMPUESTOS, binds),
        ]);

        res.json({
            cuentas:    resCuentas.rows,
            impuestos:  resImpuestos.rows,
        });

    } catch (err) {
        console.error('Error en getEstadoResultados:', err);
        res.status(500).json({ error: err.message });
    }
};
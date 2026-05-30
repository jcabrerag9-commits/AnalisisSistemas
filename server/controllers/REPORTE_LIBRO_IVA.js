const db = require('../db');

// GET /api/reportes/libro-iva?anio=2026&mes=1
exports.getLibroIVA = async (req, res) => {
    try {
        const { anio, mes, fechaInicio, fechaFin, impuestoId, monedaId, estadoAsientoId } = req.query;

        let sql = `
            SELECT
                A.ASI_FECHA                     AS FECHA,
                A.ASI_ASIENTO                   AS NO_POLIZA,
                A.ASI_GLOSA                     AS DESCRIPCION,
                I.IMP_CODIGO                    AS CODIGO_IMPUESTO,
                I.IMP_NOMBRE                    AS NOMBRE_IMPUESTO,
                I.IMP_PORCENTAJE                AS PORCENTAJE,
                IM.IMM_TIPO_AFECTACION          AS TIPO_AFECTACION,
                IM.IMM_BASE_IMPONIBLE           AS BASE_IMPONIBLE,
                IM.IMM_MONTO_IMPUESTO           AS MONTO_IMPUESTO,
                (IM.IMM_BASE_IMPONIBLE + IM.IMM_MONTO_IMPUESTO) AS TOTAL_DOCUMENTO
            FROM CON_IMPUESTO_MOVIMIENTO IM
            JOIN CON_IMPUESTO        I   ON IM.IMP_IMPUESTO          = I.IMP_IMPUESTO
            JOIN CON_ASIENTO_DETALLE AD  ON IM.ASD_ASIENTO_DETALLE   = AD.ASD_ASIENTO_DETALLE
            JOIN CON_ASIENTO         A   ON AD.ASI_ASIENTO            = A.ASI_ASIENTO
            JOIN CON_ESTADO_ASIENTO  EA  ON A.ESA_ESTADO_ASIENTO      = EA.ESA_ESTADO_ASIENTO
            WHERE 1=1
        `;

        const binds = {};

        // 1. Filtrado por Fecha/Periodo
        if (fechaInicio && fechaFin) {
            sql += ` AND A.ASI_FECHA BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
            binds.fechaInicio = fechaInicio;
            binds.fechaFin = fechaFin;
        } else if (anio && mes) {
            sql += ` AND EXTRACT(YEAR FROM A.ASI_FECHA) = :anio AND EXTRACT(MONTH FROM A.ASI_FECHA) = :mes`;
            binds.anio = parseInt(anio);
            binds.mes  = parseInt(mes);
        } else if (anio) {
            sql += ` AND EXTRACT(YEAR FROM A.ASI_FECHA) = :anio`;
            binds.anio = parseInt(anio);
        } else {
            return res.status(400).json({ error: 'Debe proporcionar año y mes, o un rango de fechas (fechaInicio y fechaFin).' });
        }

        // 2. Filtro de Impuesto Específico
        if (impuestoId) {
            sql += ` AND I.IMP_IMPUESTO = :impuestoId`;
            binds.impuestoId = Number(impuestoId);
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

        sql += ` ORDER BY IM.IMM_TIPO_AFECTACION DESC, A.ASI_FECHA, A.ASI_ASIENTO`;

        const result = await db.executeQuery(sql, binds);
        const rows   = result.rows;

        // ── Separar y totalizar en el backend ──
        const ventas  = rows.filter(r => r.TIPO_AFECTACION === 'GENERADO');
        const compras = rows.filter(r => r.TIPO_AFECTACION === 'SOPORTADO');

        const sumar = (arr, campo) =>
            arr.reduce((s, r) => s + (parseFloat(r[campo]) || 0), 0);

        res.json({
            ventas,
            compras,
            resumen: {
                totalBaseVentas:    sumar(ventas,  'BASE_IMPONIBLE'),
                totalIVAVentas:     sumar(ventas,  'MONTO_IMPUESTO'),
                totalBaseCompras:   sumar(compras, 'BASE_IMPONIBLE'),
                totalIVACompras:    sumar(compras, 'MONTO_IMPUESTO'),
                ivaLiquido:         sumar(ventas,  'MONTO_IMPUESTO') - sumar(compras, 'MONTO_IMPUESTO'),
            },
        });

    } catch (err) {
        console.error('Error en getLibroIVA:', err);
        res.status(500).json({ error: err.message });
    }
};
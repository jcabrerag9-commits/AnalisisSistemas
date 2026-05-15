const db = require('../db');

// GET /api/reportes/libro-iva?anio=2026&mes=1
exports.getLibroIVA = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio || !mes) {
            return res.status(400).json({ error: 'Debe proporcionar año y mes.' });
        }

        const binds = { anio: parseInt(anio), mes: parseInt(mes) };

        // ── Trae VENTAS (GENERADO) y COMPRAS (SOPORTADO) juntos ──
        const SQL = `
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
            JOIN CON_PERIODO         P   ON A.PER_PERIODO             = P.PER_PERIODO
            JOIN CON_ESTADO_ASIENTO  EA  ON A.ESA_ESTADO_ASIENTO      = EA.ESA_ESTADO_ASIENTO
            WHERE P.PER_AÑO = :anio
              AND P.PER_MES = :mes
              AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'
            ORDER BY IM.IMM_TIPO_AFECTACION DESC, A.ASI_FECHA, A.ASI_ASIENTO
        `;

        const result = await db.executeQuery(SQL, binds);

        // ── Separar y totalizar en el backend ──
        const ventas  = result.rows.filter(r => r.TIPO_AFECTACION === 'GENERADO');
        const compras = result.rows.filter(r => r.TIPO_AFECTACION === 'SOPORTADO');

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
                // IVA a pagar = Débito Fiscal − Crédito Fiscal
                ivaLiquido:         sumar(ventas,  'MONTO_IMPUESTO') - sumar(compras, 'MONTO_IMPUESTO'),
            },
        });

    } catch (err) {
        console.error('Error en getLibroIVA:', err);
        res.status(500).json({ error: err.message });
    }
};
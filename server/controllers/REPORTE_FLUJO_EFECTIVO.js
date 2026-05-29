const db = require('../db');

// GET /api/reportes/flujo-efectivo?anio=2026&mes=1
exports.getFlujoEfectivo = async (req, res) => {
    try {
        const { anio, mes, fechaInicio, fechaFin, monedaId, estadoAsientoId } = req.query;

        let sql = `
            SELECT
                A.ASI_FECHA                         AS FECHA,
                A.ASI_ASIENTO                       AS NO_POLIZA,
                A.ASI_GLOSA                         AS DESCRIPCION,
                C_EFE.CUE_CODIGO                    AS CODIGO_CUENTA,
                C_EFE.CUE_NOMBRE                    AS NOMBRE_CUENTA,
                AD_EFE.ASD_DEBE_LOCAL               AS ENTRADA,
                AD_EFE.ASD_HABER_LOCAL              AS SALIDA,
                -- Determina la categoría según el tipo de la cuenta contraparte del asiento
                CASE
                    WHEN (
                        SELECT SUBSTR(MIN(C2.CUE_CODIGO), 1, 2)
                        FROM CON_ASIENTO_DETALLE AD2
                        JOIN CON_CUENTA C2 ON C2.CUE_CUENTA = AD2.CUE_CUENTA
                        WHERE AD2.ASI_ASIENTO = A.ASI_ASIENTO
                          AND C2.CUE_CODIGO NOT LIKE '1101%'
                          AND C2.CUE_CODIGO NOT LIKE '1102%'
                    ) LIKE '12' THEN 'INVERSION'
                    WHEN (
                        SELECT SUBSTR(MIN(C2.CUE_CODIGO), 1, 1)
                        FROM CON_ASIENTO_DETALLE AD2
                        JOIN CON_CUENTA C2 ON C2.CUE_CUENTA = AD2.CUE_CUENTA
                        WHERE AD2.ASI_ASIENTO = A.ASI_ASIENTO
                          AND C2.CUE_CODIGO NOT LIKE '1101%'
                          AND C2.CUE_CODIGO NOT LIKE '1102%'
                    ) = '3' THEN 'FINANCIAMIENTO'
                    ELSE 'OPERACION'
                END                                 AS CATEGORIA
            FROM CON_ASIENTO_DETALLE AD_EFE
            JOIN CON_ASIENTO         A      ON A.ASI_ASIENTO         = AD_EFE.ASI_ASIENTO
            JOIN CON_CUENTA          C_EFE  ON C_EFE.CUE_CUENTA      = AD_EFE.CUE_CUENTA
            JOIN CON_ESTADO_ASIENTO  EA     ON EA.ESA_ESTADO_ASIENTO  = A.ESA_ESTADO_ASIENTO
            LEFT JOIN CON_PERIODO    P      ON P.PER_PERIODO          = A.PER_PERIODO
            WHERE 1=1
        `;

        const binds = {};

        // 1. Filtrado por Fecha/Periodo
        if (fechaInicio && fechaFin) {
            sql += ` AND A.ASI_FECHA BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
            binds.fechaInicio = fechaInicio;
            binds.fechaFin = fechaFin;
        } else if (anio && mes) {
            sql += ` AND P.PER_AÑO = :anio AND P.PER_MES = :mes`;
            binds.anio = parseInt(anio);
            binds.mes = parseInt(mes);
        } else if (anio) {
            sql += ` AND P.PER_AÑO = :anio`;
            binds.anio = parseInt(anio);
        } else {
            return res.status(400).json({ error: 'Debe proporcionar año y mes, o un rango de fechas (fechaInicio y fechaFin).' });
        }

        // 2. Filtro de Moneda
        if (monedaId) {
            sql += ` AND AD_EFE.MON_MONEDA = :monedaId`;
            binds.monedaId = Number(monedaId);
        }

        // 3. Filtro de Estado de Asiento
        if (estadoAsientoId) {
            if (estadoAsientoId !== 'TODOS') {
                sql += ` AND A.ESA_ESTADO_ASIENTO = :estadoAsientoId`;
                binds.estadoAsientoId = Number(estadoAsientoId);
            }
        } else {
            sql += ` AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'`;
        }

        sql += ` AND (C_EFE.CUE_CODIGO LIKE '1101%' OR C_EFE.CUE_CODIGO LIKE '1102%')`;
        sql += ` ORDER BY CATEGORIA, A.ASI_FECHA, A.ASI_ASIENTO`;

        const result = await db.executeQuery(sql, binds);
        const rows   = result.rows;

        // ── Agrupar por categoría ──
        const agrupar = (cat) => rows.filter(r => r.CATEGORIA === cat);

        const sumarNeto = (arr) =>
            arr.reduce((s, r) => s + (parseFloat(r.ENTRADA) || 0) - (parseFloat(r.SALIDA) || 0), 0);

        const operacion      = agrupar('OPERACION');
        const inversion      = agrupar('INVERSION');
        const financiamiento = agrupar('FINANCIAMIENTO');

        res.json({
            operacion,
            inversion,
            financiamiento,
            resumen: {
                netoOperacion:       sumarNeto(operacion),
                netoInversion:       sumarNeto(inversion),
                netoFinanciamiento:  sumarNeto(financiamiento),
                flujoNeto:           sumarNeto(rows),
            },
        });

    } catch (err) {
        console.error('Error en getFlujoEfectivo:', err);
        res.status(500).json({ error: err.message });
    }
};
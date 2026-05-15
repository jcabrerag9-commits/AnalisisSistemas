const db             = require('../db');
const asientoService = require('../services/asientoService');

// GET /api/operaciones/cierre-anual/preview?anio=2026
// Devuelve la vista previa del asiento de cierre sin generarlo.
exports.getPreview = async (req, res) => {
    try {
        const { anio } = req.query;
        if (!anio) return res.status(400).json({ error: 'Debe proporcionar el año.' });

        // ── Saldos de cuentas de ingreso y gasto para el año ──
        const SQL_SALDOS = `
            SELECT
                TC.TCU_NOMBRE                   AS TIPO,
                C.CUE_CUENTA                    AS ID_CUENTA,
                C.CUE_CODIGO                    AS CODIGO,
                C.CUE_NOMBRE                    AS NOMBRE,
                SUM(AD.ASD_DEBE_LOCAL)          AS TOTAL_DEBE,
                SUM(AD.ASD_HABER_LOCAL)         AS TOTAL_HABER
            FROM CON_ASIENTO_DETALLE AD
            JOIN CON_ASIENTO        A   ON A.ASI_ASIENTO         = AD.ASI_ASIENTO
            JOIN CON_PERIODO        P   ON P.PER_PERIODO          = A.PER_PERIODO
            JOIN CON_ESTADO_ASIENTO EA  ON EA.ESA_ESTADO_ASIENTO  = A.ESA_ESTADO_ASIENTO
            JOIN CON_CUENTA         C   ON C.CUE_CUENTA           = AD.CUE_CUENTA
            JOIN CON_TIPO_CUENTA    TC  ON TC.TCU_TIPO_CUENTA     = C.TCU_TIPO_CUENTA
            WHERE P.PER_AÑO = :anio
              AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'
              AND UPPER(TC.TCU_NOMBRE) IN ('INGRESO', 'GASTO')
              AND C.CUE_CUENTA_PADRE IS NOT NULL
            GROUP BY TC.TCU_NOMBRE, C.CUE_CUENTA, C.CUE_CODIGO, C.CUE_NOMBRE
            HAVING SUM(AD.ASD_DEBE_LOCAL) <> SUM(AD.ASD_HABER_LOCAL)
            ORDER BY C.CUE_CODIGO
        `;

        // ── Cuenta de Utilidades Retenidas ──
        const SQL_UT = `
            SELECT CUE_CUENTA, CUE_CODIGO, CUE_NOMBRE
            FROM CON_CUENTA
            WHERE CUE_CODIGO = '3102'
        `;

        const [resSaldos, resUT] = await Promise.all([
            db.executeQuery(SQL_SALDOS, { anio: parseInt(anio) }),
            db.executeQuery(SQL_UT),
        ]);

        const saldos = resSaldos.rows;

        const ingresos = saldos.filter(r => r.TIPO === 'INGRESO');
        const gastos   = saldos.filter(r => r.TIPO === 'GASTO');

        const totalIngresos = ingresos.reduce((s, r) =>
            s + (parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE)), 0);
        const totalGastos   = gastos.reduce((s, r) =>
            s + (parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER)), 0);

        const utilidadNeta = totalIngresos - totalGastos;

        res.json({
            anio:          parseInt(anio),
            ingresos,
            gastos,
            totalIngresos,
            totalGastos,
            utilidadNeta,
            cuentaUtilidades: resUT.rows[0] || null,
        });

    } catch (err) {
        console.error('Error en getPreview cierre anual:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/operaciones/cierre-anual
// Genera el asiento de cierre contable del año.
exports.ejecutarCierre = async (req, res) => {
    try {
        const { anio } = req.body;
        const usuarioId = req.usuario?.id;

        if (!anio) return res.status(400).json({ error: 'Debe proporcionar el año.' });

        // ── 1. Obtener datos de catálogo necesarios ──
        const [resPeriodo, resTipo, resEstado, resMoneda, resCuentas, resUT] =
            await Promise.all([
                // Período diciembre del año
                db.executeQuery(
                    `SELECT PER_PERIODO FROM CON_PERIODO WHERE PER_AÑO = :anio AND PER_MES = 12`,
                    { anio: parseInt(anio) }
                ),
                // Tipo de asiento AJUSTE (para el cierre)
                db.executeQuery(
                    `SELECT TPA_TIPO_ASIENTO FROM CON_TIPO_ASIENTO WHERE UPPER(TPA_CODIGO) = 'AJUSTE'`
                ),
                // Estado VALIDADO
                db.executeQuery(
                    `SELECT ESA_ESTADO_ASIENTO FROM CON_ESTADO_ASIENTO WHERE UPPER(ESA_NOMBRE) = 'VALIDADO'`
                ),
                // Moneda GTQ
                db.executeQuery(
                    `SELECT MON_MONEDA FROM CON_MONEDA WHERE UPPER(MON_CODIGO_ISO) = 'GTQ'`
                ),
                // Saldos de cuentas de resultado
                db.executeQuery(`
                    SELECT TC.TCU_NOMBRE AS TIPO, C.CUE_CUENTA AS ID_CUENTA,
                           C.CUE_CODIGO AS CODIGO, C.CUE_NOMBRE AS NOMBRE,
                           SUM(AD.ASD_DEBE_LOCAL) AS TOTAL_DEBE,
                           SUM(AD.ASD_HABER_LOCAL) AS TOTAL_HABER
                    FROM CON_ASIENTO_DETALLE AD
                    JOIN CON_ASIENTO        A   ON A.ASI_ASIENTO        = AD.ASI_ASIENTO
                    JOIN CON_PERIODO        P   ON P.PER_PERIODO         = A.PER_PERIODO
                    JOIN CON_ESTADO_ASIENTO EA  ON EA.ESA_ESTADO_ASIENTO = A.ESA_ESTADO_ASIENTO
                    JOIN CON_CUENTA         C   ON C.CUE_CUENTA          = AD.CUE_CUENTA
                    JOIN CON_TIPO_CUENTA    TC  ON TC.TCU_TIPO_CUENTA    = C.TCU_TIPO_CUENTA
                    WHERE P.PER_AÑO = :anio
                      AND UPPER(EA.ESA_NOMBRE) = 'VALIDADO'
                      AND UPPER(TC.TCU_NOMBRE) IN ('INGRESO', 'GASTO')
                      AND C.CUE_CUENTA_PADRE IS NOT NULL
                    GROUP BY TC.TCU_NOMBRE, C.CUE_CUENTA, C.CUE_CODIGO, C.CUE_NOMBRE
                    HAVING SUM(AD.ASD_DEBE_LOCAL) <> SUM(AD.ASD_HABER_LOCAL)
                    ORDER BY C.CUE_CODIGO
                `, { anio: parseInt(anio) }),
                // Cuenta Utilidades Retenidas
                db.executeQuery(
                    `SELECT CUE_CUENTA FROM CON_CUENTA WHERE CUE_CODIGO = '3102'`
                ),
            ]);

        // ── 2. Validaciones ──
        if (!resPeriodo.rows.length)
            return res.status(400).json({ error: `No existe el período Diciembre ${anio}. Créalo primero.` });
        if (!resUT.rows.length)
            return res.status(400).json({ error: 'No se encontró la cuenta 3102 (Utilidades Retenidas).' });
        if (!resCuentas.rows.length)
            return res.status(400).json({ error: 'No hay cuentas de resultado con saldo para cerrar.' });

        const periodoId  = resPeriodo.rows[0].PER_PERIODO;
        const tipoId     = resTipo.rows[0]?.TPA_TIPO_ASIENTO;
        const estadoId   = resEstado.rows[0]?.ESA_ESTADO_ASIENTO;
        const monedaId   = resMoneda.rows[0]?.MON_MONEDA;
        const cuentaUtId = resUT.rows[0].CUE_CUENTA;
        const saldos     = resCuentas.rows;

        // ── 3. Armar líneas del asiento de cierre ──
        const detalles = [];

        // INGRESOS → se cierran con DEBE (su saldo natural es HABER)
        saldos.filter(r => r.TIPO === 'INGRESO').forEach(r => {
            const saldo = parseFloat(r.TOTAL_HABER) - parseFloat(r.TOTAL_DEBE);
            if (saldo > 0) {
                detalles.push({
                    CUE_CUENTA:       r.ID_CUENTA,
                    MON_MONEDA:       monedaId,
                    CTC_TASA_CAMBIO:  1,
                    ASD_DEBE_ORIGEN:  saldo,
                    ASD_HABER_ORIGEN: 0,
                });
            }
        });

        // GASTOS → se cierran con HABER (su saldo natural es DEBE)
        saldos.filter(r => r.TIPO === 'GASTO').forEach(r => {
            const saldo = parseFloat(r.TOTAL_DEBE) - parseFloat(r.TOTAL_HABER);
            if (saldo > 0) {
                detalles.push({
                    CUE_CUENTA:       r.ID_CUENTA,
                    MON_MONEDA:       monedaId,
                    CTC_TASA_CAMBIO:  1,
                    ASD_DEBE_ORIGEN:  0,
                    ASD_HABER_ORIGEN: saldo,
                });
            }
        });

        // UTILIDADES RETENIDAS → recibe la diferencia (neto)
        const totalDebe  = detalles.reduce((s, d) => s + d.ASD_DEBE_ORIGEN, 0);
        const totalHaber = detalles.reduce((s, d) => s + d.ASD_HABER_ORIGEN, 0);
        const neto       = totalDebe - totalHaber;

        detalles.push({
            CUE_CUENTA:       cuentaUtId,
            MON_MONEDA:       monedaId,
            CTC_TASA_CAMBIO:  1,
            ASD_DEBE_ORIGEN:  neto < 0 ? Math.abs(neto) : 0,  // pérdida
            ASD_HABER_ORIGEN: neto > 0 ? neto : 0,             // utilidad
        });

        // ── 4. Crear asiento usando el servicio existente ──
        const asientoData = {
            PER_PERIODO:         periodoId,
            TPA_TIPO_ASIENTO:    tipoId,
            ESA_ESTADO_ASIENTO:  estadoId,
            USU_USUARIO:         usuarioId,
            ASI_FECHA:           `${anio}-12-31`,
            ASI_GLOSA:           `Asiento de cierre contable — Ejercicio ${anio}`,
        };

        const idGenerado = await asientoService.crearAsientoCompleto(asientoData, detalles);

        res.status(201).json({
            message:    `Cierre contable ${anio} generado correctamente.`,
            asientoId:  idGenerado,
            utilidadNeta: neto,
        });

    } catch (err) {
        console.error('Error en ejecutarCierre:', err);
        res.status(500).json({ error: err.message });
    }
};

const db = require('../db');

exports.getLibroDiario = async (req, res) => {
    try {
        const { anio, mes, fechaInicio, fechaFin, cuentaId, cuentaInicio, cuentaFin, centroCostoId, monedaId, tipoAsientoId, estadoAsientoId } = req.query;

        let sql = `
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
            JOIN CON_ESTADO_ASIENTO ea ON a.ESA_ESTADO_ASIENTO = ea.ESA_ESTADO_ASIENTO
            WHERE 1=1
        `;

        const binds = {};

        // 1. Filtrado por Fecha/Periodo
        if (fechaInicio && fechaFin) {
            sql += ` AND a.ASI_FECHA BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
            binds.fechaInicio = fechaInicio;
            binds.fechaFin = fechaFin;
        } else if (anio && mes) {
            sql += ` AND EXTRACT(YEAR FROM a.ASI_FECHA) = :anio AND EXTRACT(MONTH FROM a.ASI_FECHA) = :mes`;
            binds.anio = Number(anio);
            binds.mes = Number(mes);
        } else if (anio) {
            sql += ` AND EXTRACT(YEAR FROM a.ASI_FECHA) = :anio`;
            binds.anio = Number(anio);
        } else {
            return res.status(400).json({ error: 'Debe proporcionar al menos el año y mes, o un rango de fechas (fechaInicio y fechaFin).' });
        }

        // 2. Filtro de Cuenta Contable
        if (cuentaId) {
            sql += ` AND ad.CUE_CUENTA = :cuentaId`;
            binds.cuentaId = Number(cuentaId);
        }
        if (cuentaInicio) {
            sql += ` AND c.CUE_CODIGO >= :cuentaInicio`;
            binds.cuentaInicio = cuentaInicio;
        }
        if (cuentaFin) {
            sql += ` AND c.CUE_CODIGO <= :cuentaFin`;
            binds.cuentaFin = cuentaFin;
        }

        // 3. Filtro de Centro de Costo
        if (centroCostoId) {
            sql += ` AND ad.CTC_CENTRO_COSTO = :centroCostoId`;
            binds.centroCostoId = Number(centroCostoId);
        }

        // 4. Filtro de Moneda
        if (monedaId) {
            sql += ` AND ad.MON_MONEDA = :monedaId`;
            binds.monedaId = Number(monedaId);
        }

        // 5. Filtro de Tipo de Asiento
        if (tipoAsientoId) {
            sql += ` AND a.TPA_TIPO_ASIENTO = :tipoAsientoId`;
            binds.tipoAsientoId = Number(tipoAsientoId);
        }

        // 6. Filtro de Estado de Asiento
        if (estadoAsientoId) {
            if (estadoAsientoId !== 'TODOS') {
                sql += ` AND a.ESA_ESTADO_ASIENTO = :estadoAsientoId`;
                binds.estadoAsientoId = Number(estadoAsientoId);
            }
        } else {
            sql += ` AND UPPER(ea.ESA_NOMBRE) = 'VALIDADO'`;
        }

        sql += ` ORDER BY a.ASI_FECHA, a.ASI_ASIENTO`;

        const result = await db.executeQuery(sql, binds);
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


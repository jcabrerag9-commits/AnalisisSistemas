
const db = require('../db');

exports.getLibroDiario = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio || !mes) {
            return res.status(400).json({ error: 'Los parámetros "anio" y "mes" son obligatorios.' });
        }

        const sql = `
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
            WHERE EXTRACT(YEAR FROM a.ASI_FECHA) = :anio 
              AND EXTRACT(MONTH FROM a.ASI_FECHA) = :mes
            ORDER BY a.ASI_FECHA, a.ASI_ASIENTO
        `;

        const result = await db.executeQuery(sql, { anio: Number(anio), mes: Number(mes) });
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


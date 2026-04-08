
const db = require('../db');

exports.getLibroDiario = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio || !mes) {
            return res.status(400).json({ error: 'Los parámetros "anio" y "mes" son obligatorios.' });
        }

        const sql = `
            SELECT ANIO, MES, FECHA_POLIZA, NUMERO_POLIZA, DESCRIPCION,
                   CODIGO_CUENTA, NOMBRE_CUENTA, DEBE, HABER
            FROM V_LIBRO_DIARIO
            WHERE ANIO = :anio AND MES = :mes
            ORDER BY FECHA_POLIZA, NUMERO_POLIZA
        `;

        const result = await db.executeQuery(sql, { anio: Number(anio), mes: Number(mes) });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

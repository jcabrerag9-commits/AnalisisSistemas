
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_PERIODO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_PERIODO WHERE PER_PERIODO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES } = req.body;
        const sql = `INSERT INTO CON_PERIODO (ESP_ESTADO_PERIODO, PER_AÑO, PER_MES) VALUES (:ESP_ESTADO_PERIODO, :PER_AÑO, :PER_MES)`;
        await db.executeQuery(sql, { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES } = req.body;
        const sql = `UPDATE CON_PERIODO SET ESP_ESTADO_PERIODO = :ESP_ESTADO_PERIODO, PER_AÑO = :PER_AÑO, PER_MES = :PER_MES WHERE PER_PERIODO = :id`;
        await db.executeQuery(sql, { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_PERIODO WHERE PER_PERIODO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAniosDisponibles = async (req, res) => {
    try {
        //obtiene los años disponibles
        const sql = `
            SELECT DISTINCT PER_AÑO
            FROM CON_PERIODO 
            ORDER BY PER_AÑO DESC
        `;
        const result = await db.executeQuery(sql);
        // Mapea para que el frontend reciba el formato { value: '2026', label: '2026' }
        const aniosFormateados = result.rows.map(row => ({
            value: String(row.PER_AÑO),
            label: String(row.PER_AÑO)
        }));

        res.json(aniosFormateados);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};
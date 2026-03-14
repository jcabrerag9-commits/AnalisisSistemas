
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_TIPO_ASIENTO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_TIPO_ASIENTO WHERE TPA_TIPO_ASIENTO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { TPA_CODIGO, TPA_DESCRIPCION } = req.body;
        const sql = `INSERT INTO CON_TIPO_ASIENTO (TPA_CODIGO, TPA_DESCRIPCION) VALUES (:TPA_CODIGO, :TPA_DESCRIPCION)`;
        await db.executeQuery(sql, { TPA_CODIGO, TPA_DESCRIPCION });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { TPA_CODIGO, TPA_DESCRIPCION } = req.body;
        const sql = `UPDATE CON_TIPO_ASIENTO SET TPA_CODIGO = :TPA_CODIGO, TPA_DESCRIPCION = :TPA_DESCRIPCION WHERE TPA_TIPO_ASIENTO = :id`;
        await db.executeQuery(sql, { TPA_CODIGO, TPA_DESCRIPCION, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_TIPO_ASIENTO WHERE TPA_TIPO_ASIENTO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

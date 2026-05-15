
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_MONEDA');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_MONEDA WHERE MON_MONEDA = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO } = req.body;
        const sql = `INSERT INTO CON_MONEDA (MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO) VALUES (:MON_CODIGO_ISO, :MON_NOMBRE, :MON_SIMBOLO)`;
        await db.executeQuery(sql, { MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO } = req.body;
        console.log('Backend: Intentando actualizar moneda ID:', id, 'con datos:', { MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO });
        const sql = `UPDATE CON_MONEDA SET MON_CODIGO_ISO = :MON_CODIGO_ISO, MON_NOMBRE = :MON_NOMBRE, MON_SIMBOLO = :MON_SIMBOLO WHERE MON_MONEDA = :id`;
        await db.executeQuery(sql, { MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error('Backend Error (CON_MONEDA.update):', err);
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_MONEDA WHERE MON_MONEDA = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_ROL');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_ROL WHERE ROL_ROL = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { ROL_NOMBRE, ROL_DESCRIPCION } = req.body;
        const sql = `INSERT INTO CON_ROL (ROL_NOMBRE, ROL_DESCRIPCION) VALUES (:ROL_NOMBRE, :ROL_DESCRIPCION)`;
        await db.executeQuery(sql, { ROL_NOMBRE, ROL_DESCRIPCION });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { ROL_NOMBRE, ROL_DESCRIPCION } = req.body;
        const sql = `UPDATE CON_ROL SET ROL_NOMBRE = :ROL_NOMBRE, ROL_DESCRIPCION = :ROL_DESCRIPCION WHERE ROL_ROL = :id`;
        await db.executeQuery(sql, { ROL_NOMBRE, ROL_DESCRIPCION, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_ROL WHERE ROL_ROL = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

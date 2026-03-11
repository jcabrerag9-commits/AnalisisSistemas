
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_TIPO_CUENTA');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_TIPO_CUENTA WHERE TCU_TIPO_CUENTA = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { TCU_NOMBRE, TCU_DESCRIPCION } = req.body;
        const sql = `INSERT INTO CON_TIPO_CUENTA (TCU_NOMBRE, TCU_DESCRIPCION) VALUES (:TCU_NOMBRE, :TCU_DESCRIPCION)`;
        await db.executeQuery(sql, { TCU_NOMBRE, TCU_DESCRIPCION });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { TCU_NOMBRE, TCU_DESCRIPCION } = req.body;
        const sql = `UPDATE CON_TIPO_CUENTA SET TCU_NOMBRE = :TCU_NOMBRE, TCU_DESCRIPCION = :TCU_DESCRIPCION WHERE TCU_TIPO_CUENTA = :id`;
        await db.executeQuery(sql, { TCU_NOMBRE, TCU_DESCRIPCION, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_TIPO_CUENTA WHERE TCU_TIPO_CUENTA = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

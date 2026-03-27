
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_USUARIO ORDER BY USU_USUARIO ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_USUARIO WHERE USU_USUARIO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { USU_USER, USU_CONTRASEÑA } = req.body;
        const sql = `INSERT INTO CON_USUARIO (USU_USER, USU_CONTRASEÑA) VALUES (:USU_USER, :USU_CONTRASEÑA)`;
        await db.executeQuery(sql, { USU_USER, USU_CONTRASEÑA });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { USU_USER, USU_CONTRASEÑA } = req.body;
        const sql = `UPDATE CON_USUARIO SET USU_USER = :USU_USER, USU_CONTRASEÑA = :USU_CONTRASEÑA WHERE USU_USUARIO = :id`;
        await db.executeQuery(sql, { USU_USER, USU_CONTRASEÑA, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_USUARIO WHERE USU_USUARIO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

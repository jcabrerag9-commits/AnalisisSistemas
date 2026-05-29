
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const sql = `
            SELECT ur.*, u.USU_USER, r.ROL_NOMBRE 
            FROM CON_USUARIO_ROL ur
            JOIN CON_USUARIO u ON ur.USU_USUARIO = u.USU_USUARIO
            JOIN CON_ROL r ON ur.ROL_ROL = r.ROL_ROL
        `;
        const result = await db.executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_USUARIO_ROL WHERE USR_USUARIO_ROL = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { USU_USUARIO, ROL_ROL } = req.body;
        console.log('Backend: Recibiendo solicitud para crear Rol Usuario:', { USU_USUARIO, ROL_ROL });
        const sql = `INSERT INTO CON_USUARIO_ROL (USU_USUARIO, ROL_ROL) VALUES (:USU_USUARIO, :ROL_ROL)`;
        await db.executeQuery(sql, { USU_USUARIO, ROL_ROL });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        console.error('Backend Error (CON_USUARIO_ROL.create):', err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { USU_USUARIO, ROL_ROL } = req.body;
        const sql = `UPDATE CON_USUARIO_ROL SET USU_USUARIO = :USU_USUARIO, ROL_ROL = :ROL_ROL WHERE USR_USUARIO_ROL = :id`;
        await db.executeQuery(sql, { USU_USUARIO, ROL_ROL, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_USUARIO_ROL WHERE USR_USUARIO_ROL = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

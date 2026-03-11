
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_CUENTA');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_CUENTA WHERE CUE_CUENTA = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { CUE_CUENTA_PADRE, TCU_TIPO_CUENTA, CUE_CODIGO, CUE_NOMBRE, CUE_DESCRIPCION } = req.body;
        const sql = `INSERT INTO CON_CUENTA (CUE_CUENTA_PADRE, TCU_TIPO_CUENTA, CUE_CODIGO, CUE_NOMBRE, CUE_DESCRIPCION) VALUES (:CUE_CUENTA_PADRE, :TCU_TIPO_CUENTA, :CUE_CODIGO, :CUE_NOMBRE, :CUE_DESCRIPCION)`;
        await db.executeQuery(sql, { CUE_CUENTA_PADRE, TCU_TIPO_CUENTA, CUE_CODIGO, CUE_NOMBRE, CUE_DESCRIPCION });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { CUE_CUENTA_PADRE, TCU_TIPO_CUENTA, CUE_CODIGO, CUE_NOMBRE, CUE_DESCRIPCION } = req.body;
        const sql = `UPDATE CON_CUENTA SET CUE_CUENTA_PADRE = :CUE_CUENTA_PADRE, TCU_TIPO_CUENTA = :TCU_TIPO_CUENTA, CUE_CODIGO = :CUE_CODIGO, CUE_NOMBRE = :CUE_NOMBRE, CUE_DESCRIPCION = :CUE_DESCRIPCION WHERE CUE_CUENTA = :id`;
        await db.executeQuery(sql, { CUE_CUENTA_PADRE, TCU_TIPO_CUENTA, CUE_CODIGO, CUE_NOMBRE, CUE_DESCRIPCION, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_CUENTA WHERE CUE_CUENTA = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

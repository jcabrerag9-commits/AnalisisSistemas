
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_CENTRO_COSTO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_CENTRO_COSTO WHERE CTC_CENTRO_COSTO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE } = req.body;
        const sql = `INSERT INTO CON_CENTRO_COSTO (CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE) VALUES (:CTC_CENTRO_COSTO_PADRE, :CTC_CODIGO_DEPARTAMENTO, :CTC_NOMBRE)`;
        await db.executeQuery(sql, { CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE } = req.body;
        const sql = `UPDATE CON_CENTRO_COSTO SET CTC_CENTRO_COSTO_PADRE = :CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO = :CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE = :CTC_NOMBRE WHERE CTC_CENTRO_COSTO = :id`;
        await db.executeQuery(sql, { CTC_CENTRO_COSTO_PADRE, CTC_CODIGO_DEPARTAMENTO, CTC_NOMBRE, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_CENTRO_COSTO WHERE CTC_CENTRO_COSTO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_ASIENTO ORDER BY ASI_ASIENTO DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_ASIENTO WHERE ASI_ASIENTO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA } = req.body;
        const dateString = ASI_FECHA.length === 10 ? `${ASI_FECHA}T00:00:00` : ASI_FECHA;
        const fechaObj = new Date(dateString);
        const sql = `INSERT INTO CON_ASIENTO (PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA) VALUES (:PER_PERIODO, :TPA_TIPO_ASIENTO, :ESA_ESTADO_ASIENTO, :USU_USUARIO, :fechaObj, :ASI_GLOSA)`;
        await db.executeQuery(sql, { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, fechaObj, ASI_GLOSA });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA } = req.body;
        const dateString = ASI_FECHA.length === 10 ? `${ASI_FECHA}T00:00:00` : ASI_FECHA;
        const fechaObj = new Date(dateString);
        const sql = `UPDATE CON_ASIENTO SET PER_PERIODO = :PER_PERIODO, TPA_TIPO_ASIENTO = :TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO = :ESA_ESTADO_ASIENTO, USU_USUARIO = :USU_USUARIO, ASI_FECHA = :fechaObj, ASI_GLOSA = :ASI_GLOSA WHERE ASI_ASIENTO = :id`;
        await db.executeQuery(sql, { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, fechaObj, ASI_GLOSA, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_ASIENTO WHERE ASI_ASIENTO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

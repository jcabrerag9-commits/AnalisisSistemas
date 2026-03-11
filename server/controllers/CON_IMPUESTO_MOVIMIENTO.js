
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_IMPUESTO_MOVIMIENTO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_IMPUESTO_MOVIMIENTO WHERE IMM_IMPUESTO_MOVIMIENTO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { ASD_ASIENTO_DETALLE, IMP_IMPUESTO, IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION } = req.body;
        const sql = `INSERT INTO CON_IMPUESTO_MOVIMIENTO (ASD_ASIENTO_DETALLE, IMP_IMPUESTO, IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION) VALUES (:ASD_ASIENTO_DETALLE, :IMP_IMPUESTO, :IMM_BASE_IMPONIBLE, :IMM_MONTO_IMPUESTO, :IMM_TIPO_AFECTACION)`;
        await db.executeQuery(sql, { ASD_ASIENTO_DETALLE, IMP_IMPUESTO, IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { ASD_ASIENTO_DETALLE, IMP_IMPUESTO, IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION } = req.body;
        const sql = `UPDATE CON_IMPUESTO_MOVIMIENTO SET ASD_ASIENTO_DETALLE = :ASD_ASIENTO_DETALLE, IMP_IMPUESTO = :IMP_IMPUESTO, IMM_BASE_IMPONIBLE = :IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO = :IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION = :IMM_TIPO_AFECTACION WHERE IMM_IMPUESTO_MOVIMIENTO = :id`;
        await db.executeQuery(sql, { ASD_ASIENTO_DETALLE, IMP_IMPUESTO, IMM_BASE_IMPONIBLE, IMM_MONTO_IMPUESTO, IMM_TIPO_AFECTACION, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_IMPUESTO_MOVIMIENTO WHERE IMM_IMPUESTO_MOVIMIENTO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

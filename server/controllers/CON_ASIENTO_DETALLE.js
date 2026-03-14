
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_ASIENTO_DETALLE');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_ASIENTO_DETALLE WHERE ASD_ASIENTO_DETALLE = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { ASI_ASIENTO, CUE_CUENTA, CTC_CENTRO_COSTO, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN, ASD_DEBE_LOCAL, ASD_HABER_LOCAL } = req.body;
        const sql = `INSERT INTO CON_ASIENTO_DETALLE (ASI_ASIENTO, CUE_CUENTA, CTC_CENTRO_COSTO, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN, ASD_DEBE_LOCAL, ASD_HABER_LOCAL) VALUES (:ASI_ASIENTO, :CUE_CUENTA, :CTC_CENTRO_COSTO, :MON_MONEDA, :CTC_TASA_CAMBIO, :ASD_DEBE_ORIGEN, :ASD_HABER_ORIGEN, :ASD_DEBE_LOCAL, :ASD_HABER_LOCAL)`;
        await db.executeQuery(sql, { ASI_ASIENTO, CUE_CUENTA, CTC_CENTRO_COSTO, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN, ASD_DEBE_LOCAL, ASD_HABER_LOCAL });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { ASI_ASIENTO, CUE_CUENTA, CTC_CENTRO_COSTO, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN, ASD_DEBE_LOCAL, ASD_HABER_LOCAL } = req.body;
        const sql = `UPDATE CON_ASIENTO_DETALLE SET ASI_ASIENTO = :ASI_ASIENTO, CUE_CUENTA = :CUE_CUENTA, CTC_CENTRO_COSTO = :CTC_CENTRO_COSTO, MON_MONEDA = :MON_MONEDA, CTC_TASA_CAMBIO = :CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN = :ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN = :ASD_HABER_ORIGEN, ASD_DEBE_LOCAL = :ASD_DEBE_LOCAL, ASD_HABER_LOCAL = :ASD_HABER_LOCAL WHERE ASD_ASIENTO_DETALLE = :id`;
        await db.executeQuery(sql, { ASI_ASIENTO, CUE_CUENTA, CTC_CENTRO_COSTO, MON_MONEDA, CTC_TASA_CAMBIO, ASD_DEBE_ORIGEN, ASD_HABER_ORIGEN, ASD_DEBE_LOCAL, ASD_HABER_LOCAL, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_ASIENTO_DETALLE WHERE ASD_ASIENTO_DETALLE = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

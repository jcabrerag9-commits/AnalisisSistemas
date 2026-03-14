
const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_TIPO_CAMBIO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_TIPO_CAMBIO WHERE TPC_TIPO_CAMBIO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { MON_MONEDA, TPC_FECHA_TASA, TPC_TASA_COMPRA, TPC_TASA_VENTA } = req.body;
        const sql = `INSERT INTO CON_TIPO_CAMBIO (MON_MONEDA, TPC_FECHA_TASA, TPC_TASA_COMPRA, TPC_TASA_VENTA) VALUES (:MON_MONEDA, :TPC_FECHA_TASA, :TPC_TASA_COMPRA, :TPC_TASA_VENTA)`;
        await db.executeQuery(sql, { MON_MONEDA, TPC_FECHA_TASA, TPC_TASA_COMPRA, TPC_TASA_VENTA });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { MON_MONEDA, TPC_FECHA_TASA, TPC_TASA_COMPRA, TPC_TASA_VENTA } = req.body;
        const sql = `UPDATE CON_TIPO_CAMBIO SET MON_MONEDA = :MON_MONEDA, TPC_FECHA_TASA = :TPC_FECHA_TASA, TPC_TASA_COMPRA = :TPC_TASA_COMPRA, TPC_TASA_VENTA = :TPC_TASA_VENTA WHERE TPC_TIPO_CAMBIO = :id`;
        await db.executeQuery(sql, { MON_MONEDA, TPC_FECHA_TASA, TPC_TASA_COMPRA, TPC_TASA_VENTA, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_TIPO_CAMBIO WHERE TPC_TIPO_CAMBIO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

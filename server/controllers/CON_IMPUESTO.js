const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_IMPUESTO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_IMPUESTO WHERE IMP_IMPUESTO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { CUE_CUENTA, IMP_CODIGO, IMP_NOMBRE, IMP_PORCENTAJE, IMP_FECHA_VIGENCIA_INICIO, IMP_FECHA_VIGENCIA_FIN, IMP_ESTADO } = req.body;
        const sql = `INSERT INTO CON_IMPUESTO (CUE_CUENTA, IMP_CODIGO, IMP_NOMBRE, IMP_PORCENTAJE, IMP_FECHA_VIGENCIA_INICIO, IMP_FECHA_VIGENCIA_FIN, IMP_ESTADO) 
                     VALUES (:CUE_CUENTA, :IMP_CODIGO, :IMP_NOMBRE, :IMP_PORCENTAJE, 
                     TO_DATE(:IMP_FECHA_VIGENCIA_INICIO, 'YYYY-MM-DD'), 
                     TO_DATE(:IMP_FECHA_VIGENCIA_FIN, 'YYYY-MM-DD'), 
                     :IMP_ESTADO)`;
        await db.executeQuery(sql, { CUE_CUENTA, IMP_CODIGO, IMP_NOMBRE, IMP_PORCENTAJE, IMP_FECHA_VIGENCIA_INICIO, IMP_FECHA_VIGENCIA_FIN, IMP_ESTADO });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { CUE_CUENTA, IMP_CODIGO, IMP_NOMBRE, IMP_PORCENTAJE, IMP_FECHA_VIGENCIA_INICIO, IMP_FECHA_VIGENCIA_FIN, IMP_ESTADO } = req.body;
        const sql = `UPDATE CON_IMPUESTO SET CUE_CUENTA = :CUE_CUENTA, IMP_CODIGO = :IMP_CODIGO, 
                     IMP_NOMBRE = :IMP_NOMBRE, IMP_PORCENTAJE = :IMP_PORCENTAJE, 
                     IMP_FECHA_VIGENCIA_INICIO = TO_DATE(:IMP_FECHA_VIGENCIA_INICIO, 'YYYY-MM-DD'), 
                     IMP_FECHA_VIGENCIA_FIN = TO_DATE(:IMP_FECHA_VIGENCIA_FIN, 'YYYY-MM-DD'), 
                     IMP_ESTADO = :IMP_ESTADO WHERE IMP_IMPUESTO = :id`;
        await db.executeQuery(sql, { CUE_CUENTA, IMP_CODIGO, IMP_NOMBRE, IMP_PORCENTAJE, IMP_FECHA_VIGENCIA_INICIO, IMP_FECHA_VIGENCIA_FIN, IMP_ESTADO, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_IMPUESTO WHERE IMP_IMPUESTO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
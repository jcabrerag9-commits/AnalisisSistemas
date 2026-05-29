const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.BIT_BITACORA,
                b.USU_USUARIO,
                u.USU_USER,
                b.BIT_TABLA_AFECTADA,
                b.BIT_ACCION,
                b.BIT_FECHA_HORA,
                DBMS_LOB.SUBSTR(b.BIT_DATOS_PREVIOS, 2000, 1) AS BIT_DATOS_PREVIOS
            FROM CON_BITACORA b
            LEFT JOIN CON_USUARIO u ON b.USU_USUARIO = u.USU_USUARIO
            ORDER BY b.BIT_BITACORA DESC
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
        const sql = `
            SELECT 
                BIT_BITACORA,
                USU_USUARIO,
                BIT_TABLA_AFECTADA,
                BIT_ACCION,
                BIT_FECHA_HORA,
                DBMS_LOB.SUBSTR(BIT_DATOS_PREVIOS, 2000, 1) AS BIT_DATOS_PREVIOS
            FROM CON_BITACORA
            WHERE BIT_BITACORA = :id
        `;
        const result = await db.executeQuery(sql, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, BIT_FECHA_HORA, BIT_DATOS_PREVIOS } = req.body;
        let fechaHora = new Date();
        if (BIT_FECHA_HORA) {
            const dateString = BIT_FECHA_HORA.length === 10 ? `${BIT_FECHA_HORA}T00:00:00` : BIT_FECHA_HORA;
            fechaHora = new Date(dateString);
        }
        const sql = `INSERT INTO CON_BITACORA (USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, BIT_FECHA_HORA, BIT_DATOS_PREVIOS) VALUES (:USU_USUARIO, :BIT_TABLA_AFECTADA, :BIT_ACCION, :fechaHora, :BIT_DATOS_PREVIOS)`;
        await db.executeQuery(sql, { USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, fechaHora, BIT_DATOS_PREVIOS });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        console.error('Error en create CON_BITACORA:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, BIT_FECHA_HORA, BIT_DATOS_PREVIOS } = req.body;
        let fechaHora = new Date();
        if (BIT_FECHA_HORA) {
            const dateString = BIT_FECHA_HORA.length === 10 ? `${BIT_FECHA_HORA}T00:00:00` : BIT_FECHA_HORA;
            fechaHora = new Date(dateString);
        }
        const sql = `UPDATE CON_BITACORA SET USU_USUARIO = :USU_USUARIO, BIT_TABLA_AFECTADA = :BIT_TABLA_AFECTADA, BIT_ACCION = :BIT_ACCION, BIT_FECHA_HORA = :fechaHora, BIT_DATOS_PREVIOS = :BIT_DATOS_PREVIOS WHERE BIT_BITACORA = :id`;
        await db.executeQuery(sql, { USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, fechaHora, BIT_DATOS_PREVIOS, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error('Error en update CON_BITACORA:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_BITACORA WHERE BIT_BITACORA = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const db = require('../db');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_PERIODO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.executeQuery('SELECT * FROM CON_PERIODO WHERE PER_PERIODO = :id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES } = req.body;
        const sql = `INSERT INTO CON_PERIODO (ESP_ESTADO_PERIODO, PER_AÑO, PER_MES) VALUES (:ESP_ESTADO_PERIODO, :PER_AÑO, :PER_MES)`;
        await db.executeQuery(sql, { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES } = req.body;
        const sql = `UPDATE CON_PERIODO SET ESP_ESTADO_PERIODO = :ESP_ESTADO_PERIODO, PER_AÑO = :PER_AÑO, PER_MES = :PER_MES WHERE PER_PERIODO = :id`;
        await db.executeQuery(sql, { ESP_ESTADO_PERIODO, PER_AÑO, PER_MES, id });
        res.json({ message: 'Updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await db.executeQuery('DELETE FROM CON_PERIODO WHERE PER_PERIODO = :id', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAniosDisponibles = async (req, res) => {
    try {
        //obtiene los años disponibles
        const sql = `
            SELECT DISTINCT PER_AÑO
            FROM CON_PERIODO 
            ORDER BY PER_AÑO DESC
        `;
        const result = await db.executeQuery(sql);
        // Mapea para que el frontend reciba el formato { value: '2026', label: '2026' }
        const aniosFormateados = result.rows.map(row => ({
            value: String(row.PER_AÑO),
            label: String(row.PER_AÑO)
        }));

        res.json(aniosFormateados);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

exports.abrirPeriodo = async (req, res) => {
    try {
        const { p_anio, p_mes } = req.body;
        const sql = `BEGIN SP_ABRIR_PERIODO(:p_anio, :p_mes); END;`;
        await db.executeQuery(sql, { p_anio, p_mes });
        res.json({ message: 'Periodo abierto exitosamente' });
    } catch (err) {
        if (err.message.includes('ORA-20001')) res.status(400).json({ error: 'El periodo ya se encuentra registrado.' });
        else if (err.message.includes('ORA-20002')) res.status(400).json({ error: 'El periodo anterior no está CERRADO. Cierre primero el mes pasado.' });
        else if (err.message.includes('ORA-20003')) res.status(400).json({ error: 'El periodo inmediato anterior no existe.' });
        else res.status(500).json({ error: err.message });
    }
};

exports.cerrarPeriodoMensual = async (req, res) => {
    try {
        const { p_periodo_id } = req.body;
        const sql = `BEGIN SP_CERRAR_PERIODO_MENSUAL(:p_periodo_id); END;`;
        await db.executeQuery(sql, { p_periodo_id });
        res.json({ message: 'Periodo cerrado exitosamente' });
    } catch (err) {
        if (err.message.includes('ORA-20010')) res.status(400).json({ error: 'Bloqueo de Auditoría: Existen asientos en estado BORRADOR. Debe validarlos o anularlos antes de cerrar.' });
        else if (err.message.includes('ORA-20011')) res.status(404).json({ error: 'El ID de periodo proporcionado no existe.' });
        else res.status(500).json({ error: err.message });
    }
};

exports.cierreEjercicioAnual = async (req, res) => {
    try {
        const { p_anio, p_cuenta_utilidad_id, p_usuario_id, p_moneda_id } = req.body;
        const sql = `BEGIN SP_CIERRE_EJERCICIO_ANUAL(:p_anio, :p_cuenta_utilidad_id, :p_usuario_id, :p_moneda_id); END;`;
        await db.executeQuery(sql, { p_anio, p_cuenta_utilidad_id, p_usuario_id, p_moneda_id });
        res.json({ message: 'Cierre de Ejercicio Anual realizado exitosamente' });
    } catch (err) {
        if (err.message.includes('ORA-20020')) res.status(400).json({ error: 'Aún existen periodos abiertos en el año.' });
        else if (err.message.includes('ORA-20021')) res.status(400).json({ error: 'No existe un tipo de asiento con código CIERRE.' });
        else if (err.message.includes('ORA-20022')) res.status(400).json({ error: 'Error crítico de redondeo o cálculo. El asiento de cierre no cuadra.' });
        else res.status(500).json({ error: err.message });
    }
};
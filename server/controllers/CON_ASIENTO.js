
const oracledb = require('oracledb');
const db = require('../db');
const asientoService = require('../services/asientoService');

exports.getAll = async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CON_ASIENTO');
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
        // Recibimos los campos que ya tenés + un array de detalles
        const {
            PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO,
            USU_USUARIO, ASI_FECHA, ASI_GLOSA,
            detalles // <--- Esto es lo nuevo que debés mandar desde el front
        } = req.body;

        // Validamos que vengan movimientos
        if (!detalles || detalles.length < 2) {
            return res.status(400).json({ error: "Un asiento contable debe tener al menos dos movimientos." });
        }

        // Le mandamos todo al Service para que haga la magia
        const dataAsiento = { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA };
        const idGenerado = await asientoService.crearAsientoCompleto(dataAsiento, detalles);

        res.status(201).json({
            message: 'Asiento creado y cuadrado correctamente',
            id: idGenerado
        });
    } catch (err) {
        // Si el Service tira un error (ej: "No cuadra"), cae aquí
        res.status(500).json({ error: err.message });
    }
};

/*exports.create = async (req, res) => {
    try {
        const { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA } = req.body;
        const sql = `INSERT INTO CON_ASIENTO (PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA) VALUES (:PER_PERIODO, :TPA_TIPO_ASIENTO, :ESA_ESTADO_ASIENTO, :USU_USUARIO, :ASI_FECHA, :ASI_GLOSA)`;
        await db.executeQuery(sql, { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA });
        res.status(201).json({ message: 'Created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};*/

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO,
            USU_USUARIO, ASI_FECHA, ASI_GLOSA,
            detalles
        } = req.body;

        if (!detalles || detalles.length < 2) {
            return res.status(400).json({ error: "Un asiento contable debe tener al menos dos movimientos." });
        }

        const dataAsiento = { PER_PERIODO, TPA_TIPO_ASIENTO, ESA_ESTADO_ASIENTO, USU_USUARIO, ASI_FECHA, ASI_GLOSA };
        await asientoService.editarAsientoCompleto(id, dataAsiento, detalles);

        res.json({ message: 'Asiento actualizado correctamente' });
    } catch (err) {
        // Captura errores del SP (ej: periodo cerrado, descuadre)
        const status = err.message.includes('ORA-20') ? 400 : 500;
        res.status(status).json({ error: err.message });
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

exports.anular = async (req, res) => {
    try {
        const id = req.body.id || req.body.ASI_ASIENTO || req.body.asi_asiento;
        const usuarioId = req.body.usuarioId || req.body.USU_USUARIO || req.body.usu_usuario;
        const motivo = req.body.motivo || req.body.motivo_anulacion;

        if (!motivo || motivo.trim() === '') {
            return res.status(400).json({ error: 'El motivo de anulación es obligatorio' });
        }

        if (!usuarioId) {
            return res.status(400).json({ error: 'Se requiere el ID del usuario' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Se requiere el ID del asiento' });
        }

        const sql = `
            BEGIN 
                SP_ANULAR_ASIENTO(
                    p_asi_asiento => :asi_asiento,
                    p_usu_usuario => :usu_usuario,
                    p_motivo_anulacion => :motivo,
                    p_resultado => :resultado,
                    p_mensaje => :mensaje,
                    p_asiento_reversion => :asiento_rev
                );
            END;`;

        const binds = {
            asi_asiento: Number(id),
            usu_usuario: Number(usuarioId),
            motivo: motivo,
            resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
            mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
            asiento_rev: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await db.executeQuery(sql, binds);
        const { resultado, mensaje, asiento_rev } = result.outBinds;

        if (resultado === 'EXITO') {
            res.status(200).json({
                message: mensaje,
                data: {
                    asientoAnulado: Number(id),
                    asientoReversion: asiento_rev
                }
            });
        } else {
            res.status(400).json({ error: mensaje, detalle: resultado });
        }
    } catch (err) {
        console.error('Error al anular asiento:', err);
        res.status(500).json({ error: err.message });
    }
};

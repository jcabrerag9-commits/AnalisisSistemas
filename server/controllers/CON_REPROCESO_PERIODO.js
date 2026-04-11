const db = require('../db');

// GET /api/con-reproceso-periodo/buscar?anio=2025&mes=3
// Los dos parámetros son opcionales pero al menos uno debe venir
exports.buscarPeriodo = async (req, res) => {
    try {
        const { anio, mes } = req.query;

        if (!anio && !mes) {
            return res.status(400).json({ error: 'Debe proporcionar al menos el año o el mes.' });
        }

        // Construir WHERE dinámicamente según los parámetros recibidos
        const condiciones = [`E.ESP_NOMBRE = 'CERRADO'`];
        const binds = {};

        if (anio) {
            condiciones.push('P.PER_AÑO = :anio');
            binds.anio = parseInt(anio);
        }
        if (mes) {
            condiciones.push('P.PER_MES = :mes');
            binds.mes = parseInt(mes);
        }

        const SQL = `
            SELECT 
                P.PER_PERIODO,
                P.PER_AÑO,
                P.PER_MES,
                P.ESP_ESTADO_PERIODO,
                E.ESP_NOMBRE
            FROM CON_PERIODO P
            JOIN CON_ESTADO_PERIODO E ON P.ESP_ESTADO_PERIODO = E.ESP_ESTADO_PERIODO
            WHERE ${condiciones.join(' AND ')}
            ORDER BY P.PER_AÑO DESC, P.PER_MES DESC
        `;

        const result = await db.executeQuery(SQL, binds);

        // Siempre devolver array (puede estar vacío)
        res.json(result.rows);

    } catch (err) {
        console.error('Error en buscarPeriodo:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/con-reproceso-periodo/ejecutar
exports.ejecutarReproceso = async (req, res) => {
    try {
        const { PER_PERIODO, USU_USUARIO, MOTIVO } = req.body;

        if (!PER_PERIODO || !USU_USUARIO || !MOTIVO) {
            return res.status(400).json({ error: 'Faltan datos requeridos: PER_PERIODO, USU_USUARIO, MOTIVO.' });
        }

        if (MOTIVO.trim().length < 20) {
            return res.status(400).json({ error: 'El motivo debe tener al menos 20 caracteres.' });
        }

        // 1. Verificar que el período existe y está CERRADO
        const CHECK_SQL = `
            SELECT P.PER_PERIODO, P.PER_AÑO, P.PER_MES, E.ESP_NOMBRE
            FROM CON_PERIODO P
            JOIN CON_ESTADO_PERIODO E ON P.ESP_ESTADO_PERIODO = E.ESP_ESTADO_PERIODO
            WHERE P.PER_PERIODO = :id
        `;
        const checkResult = await db.executeQuery(CHECK_SQL, { id: PER_PERIODO });

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'El período no existe.' });
        }

        const periodo = checkResult.rows[0];

        if (periodo.ESP_NOMBRE !== 'CERRADO') {
            return res.status(400).json({
                error: `El período no está CERRADO. Estado actual: ${periodo.ESP_NOMBRE}`
            });
        }

        // 2. Obtener el ID del estado ABIERTO
        const ESTADO_SQL = `SELECT ESP_ESTADO_PERIODO FROM CON_ESTADO_PERIODO WHERE ESP_NOMBRE = 'ABIERTO'`;
        const estadoResult = await db.executeQuery(ESTADO_SQL);

        if (estadoResult.rows.length === 0) {
            return res.status(500).json({ error: 'No existe el estado ABIERTO en CON_ESTADO_PERIODO.' });
        }

        const ID_ESTADO_ABIERTO = estadoResult.rows[0].ESP_ESTADO_PERIODO;

        // 3. Actualizar el período a ABIERTO
        const UPDATE_SQL = `
            UPDATE CON_PERIODO 
            SET ESP_ESTADO_PERIODO = :ESP_ESTADO_PERIODO
            WHERE PER_PERIODO = :PER_PERIODO
        `;
        await db.executeQuery(UPDATE_SQL, {
            ESP_ESTADO_PERIODO: ID_ESTADO_ABIERTO,
            PER_PERIODO: PER_PERIODO
        });

        // 4. Registrar en CON_BITACORA
        const DATOS_PREVIOS = JSON.stringify({
            PER_PERIODO: periodo.PER_PERIODO,
            PER_AÑO: periodo.PER_AÑO,
            PER_MES: periodo.PER_MES,
            ESTADO_ANTERIOR: 'CERRADO',
            MOTIVO_REPROCESO: MOTIVO.trim()
        });

        const BITACORA_SQL = `
            INSERT INTO CON_BITACORA (USU_USUARIO, BIT_TABLA_AFECTADA, BIT_ACCION, BIT_DATOS_PREVIOS)
            VALUES (:USU_USUARIO, 'CON_PERIODO', 'REPROCESO', :BIT_DATOS_PREVIOS)
        `;
        await db.executeQuery(BITACORA_SQL, {
            USU_USUARIO: USU_USUARIO,
            BIT_DATOS_PREVIOS: DATOS_PREVIOS
        });

        res.json({
            message: `Período ${periodo.PER_MES}/${periodo.PER_AÑO} reabierto correctamente.`,
            periodo: {
                PER_PERIODO: periodo.PER_PERIODO,
                PER_AÑO: periodo.PER_AÑO,
                PER_MES: periodo.PER_MES
            }
        });

    } catch (err) {
        console.error('Error en ejecutarReproceso:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/con-reproceso-periodo/historial
exports.obtenerHistorial = async (req, res) => {
    try {
        const SQL = `
            SELECT 
                B.BIT_BITACORA,
                B.BIT_FECHA_HORA,
                U.USU_USER,
                JSON_VALUE(B.BIT_DATOS_PREVIOS, '$.MOTIVO_REPROCESO') AS MOTIVO,
                JSON_VALUE(B.BIT_DATOS_PREVIOS, '$.PER_AÑO') || '/' || 
                    LPAD(JSON_VALUE(B.BIT_DATOS_PREVIOS, '$.PER_MES'), 2, '0') AS PERIODO
            FROM CON_BITACORA B
            JOIN CON_USUARIO U ON B.USU_USUARIO = U.USU_USUARIO
            WHERE B.BIT_ACCION = 'REPROCESO'
            ORDER BY B.BIT_FECHA_HORA DESC
            FETCH FIRST 50 ROWS ONLY
        `;

        const result = await db.executeQuery(SQL);
        res.json(result.rows);
    } catch (err) {
        console.error('Error en obtenerHistorial:', err);
        res.status(500).json({ error: err.message });
    }
};
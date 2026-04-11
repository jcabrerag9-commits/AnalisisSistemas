const oracledb = require('oracledb');
const db = require('../db');

// Función de utilidad para cumplir con el requisito de 2 decimales estrictos
const formatMoney = (amount) => Math.round(amount * 100) / 100;

exports.crearAsientoCompleto = async (asientoData, detalles) => {
    try {
        let totalDebe = 0;
        let totalHaber = 0;

        // Procesar detalles y calcular montos locales
        const detallesProcesados = detalles.map(det => {
            const debeLocal = formatMoney((det.ASD_DEBE_ORIGEN || 0) * (det.CTC_TASA_CAMBIO || 1));
            const haberLocal = formatMoney((det.ASD_HABER_ORIGEN || 0) * (det.CTC_TASA_CAMBIO || 1));

            totalDebe += debeLocal;
            totalHaber += haberLocal;

            return {
                CUE_CUENTA: det.CUE_CUENTA,
                CTC_CENTRO_COSTO: det.CTC_CENTRO_COSTO || null,
                MON_MONEDA: det.MON_MONEDA,
                CTC_TASA_CAMBIO: det.CTC_TASA_CAMBIO,
                ASD_DEBE_ORIGEN: det.ASD_DEBE_ORIGEN || 0,
                ASD_HABER_ORIGEN: det.ASD_HABER_ORIGEN || 0,
                ASD_DEBE_LOCAL: debeLocal,
                ASD_HABER_LOCAL: haberLocal,
            };
        });

        // Validación de Partida Doble en el Backend
        if (Math.abs(totalDebe - totalHaber) > 0.01) {
            throw new Error(`Asiento descuadrado. Diferencia: ${formatMoney(totalDebe - totalHaber)}`);
        }

        // Llamada al SP de Oracle
        const asientoId = await guardarEnOracle(asientoData, detallesProcesados);
        return asientoId;
    } catch (err) {
        throw err;
    }
};

async function guardarEnOracle(header, detallesProcesados) {
    let connection;
    try {
        connection = await oracledb.getConnection(db.dbConfig);

        const sql = `
            BEGIN
                SP_INSERTAR_ASIENTO_COMPLETO(
                    :p_per_periodo,
                    :p_tpa_tipo_asiento,
                    :p_esa_estado_asiento,
                    :p_usu_usuario,
                    :p_asi_fecha,
                    :p_asi_glosa,
                    :p_detalles_json,
                    :p_id_out
                );
            END;
        `;

        const result = await connection.execute(sql, {
            p_per_periodo: Number(header.PER_PERIODO),
            p_tpa_tipo_asiento: Number(header.TPA_TIPO_ASIENTO),
            p_esa_estado_asiento: Number(header.ESA_ESTADO_ASIENTO),
            p_usu_usuario: Number(header.USU_USUARIO),
            p_asi_fecha: new Date(header.ASI_FECHA),
            p_asi_glosa: header.ASI_GLOSA,
            p_detalles_json: { val: JSON.stringify(detallesProcesados), type: oracledb.CLOB },
            p_id_out: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        });

        await connection.commit();
        return result.outBinds.p_id_out;
    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) await connection.close();
    }
}

// ══════════════════════════════════════════
//  EDITAR ASIENTO COMPLETO (SP_EDITAR_ASIENTO)
// ══════════════════════════════════════════
exports.editarAsientoCompleto = async (asientoId, asientoData, detalles) => {
    try {
        let totalDebe = 0;
        let totalHaber = 0;

        const detallesProcesados = detalles.map(det => {
            const debeLocal = formatMoney((det.ASD_DEBE_ORIGEN || 0) * (det.CTC_TASA_CAMBIO || 1));
            const haberLocal = formatMoney((det.ASD_HABER_ORIGEN || 0) * (det.CTC_TASA_CAMBIO || 1));

            totalDebe += debeLocal;
            totalHaber += haberLocal;

            return {
                ASD_ASIENTO_DETALLE: det.ASD_ASIENTO_DETALLE || null, // null = fila nueva
                CUE_CUENTA: det.CUE_CUENTA,
                CTC_CENTRO_COSTO: det.CTC_CENTRO_COSTO || null,
                MON_MONEDA: det.MON_MONEDA,
                CTC_TASA_CAMBIO: det.CTC_TASA_CAMBIO,
                ASD_DEBE_ORIGEN: det.ASD_DEBE_ORIGEN || 0,
                ASD_HABER_ORIGEN: det.ASD_HABER_ORIGEN || 0,
                ASD_DEBE_LOCAL: debeLocal,
                ASD_HABER_LOCAL: haberLocal,
            };
        });

        // Validación de Partida Doble en el Backend
        if (Math.abs(totalDebe - totalHaber) > 0.01) {
            throw new Error(`Asiento descuadrado. Diferencia: ${formatMoney(totalDebe - totalHaber)}`);
        }

        await editarEnOracle(asientoId, asientoData, detallesProcesados);
    } catch (err) {
        throw err;
    }
};

async function editarEnOracle(asientoId, header, detallesProcesados) {
    let connection;
    try {
        connection = await oracledb.getConnection(db.dbConfig);

        const sql = `
            BEGIN
                SP_EDITAR_ASIENTO(
                    :p_asi_asiento,
                    :p_per_periodo,
                    :p_tpa_tipo_asiento,
                    :p_esa_estado_asiento,
                    :p_usu_usuario,
                    :p_asi_fecha,
                    :p_asi_glosa,
                    :p_detalles_json
                );
            END;
        `;

        await connection.execute(sql, {
            p_asi_asiento: Number(asientoId),
            p_per_periodo: Number(header.PER_PERIODO),
            p_tpa_tipo_asiento: Number(header.TPA_TIPO_ASIENTO),
            p_esa_estado_asiento: Number(header.ESA_ESTADO_ASIENTO),
            p_usu_usuario: Number(header.USU_USUARIO),
            p_asi_fecha: new Date(header.ASI_FECHA),
            p_asi_glosa: header.ASI_GLOSA,
            p_detalles_json: { val: JSON.stringify(detallesProcesados), type: oracledb.CLOB },
        });

        await connection.commit();
    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) await connection.close();
    }
}
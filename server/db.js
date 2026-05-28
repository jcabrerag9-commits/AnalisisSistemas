const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
require('dotenv').config();

// Habilitar la conversión de CLOBs a strings por defecto
oracledb.fetchAsString = [oracledb.CLOB];

// Resolver la ruta absoluta del Wallet
const walletPath = process.env.WALLET_PATH ? path.resolve(process.env.WALLET_PATH) : null;

// Configuración de la base de datos para Thin Mode leyendo el Wallet de forma nativa.
// ORÁCULO DE DISEÑO: En Thin Mode, 'configDir' es una propiedad que debe pasarse explícitamente 
// dentro de las opciones de conexión (dbConfig) y no como propiedad global de la librería.
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_STRING, // Alias de conexión (ej. 'contabilidad_medium')
    walletLocation: walletPath,           // Directorio con ewallet.p12 / ewallet.pem
    walletPassword: process.env.WALLET_PASSWORD || process.env.DB_PASSWORD,
    configDir: walletPath                 // Directorio donde reside tnsnames.ora (CRÍTICO para resolver el alias)
};

let pool;

/**
 * Inicializa el pool de conexiones a la base de datos en Thin Mode
 */
async function initialize() {
    try {
        if (!pool) {
            console.log('Iniciando pool de conexiones a Oracle en Thin Mode...');
            
            // ── LOGS TEMPORALES DE DIAGNÓSTICO DE RED/SISTEMA DE ARCHIVOS ──
            console.log('=== [Diagnóstico de Conectividad Oracle Thin Mode] ===');
            console.log(`- Wallet Path resuelto: ${walletPath}`);
            console.log(`- oracledb.configDir (Global antes de conectar): ${oracledb.configDir}`);
            console.log(`- dbConfig.configDir (Local para el Pool): ${dbConfig.configDir}`);
            console.log(`- dbConfig.connectString (Alias): ${dbConfig.connectString}`);
            
            if (walletPath) {
                const tnsnamesExists = fs.existsSync(path.join(walletPath, 'tnsnames.ora'));
                const sqlnetExists = fs.existsSync(path.join(walletPath, 'sqlnet.ora'));
                const p12Exists = fs.existsSync(path.join(walletPath, 'ewallet.p12'));
                
                console.log(`- ¿Existe tnsnames.ora físicamente?: ${tnsnamesExists ? 'SÍ' : 'NO'}`);
                console.log(`- ¿Existe sqlnet.ora físicamente?: ${sqlnetExists ? 'SÍ' : 'NO'}`);
                console.log(`- ¿Existe ewallet.p12 físicamente?: ${p12Exists ? 'SÍ' : 'NO'}`);
            } else {
                console.log('- ERROR: WALLET_PATH no está definido en las variables de entorno.');
            }
            console.log('======================================================');

            pool = await oracledb.createPool({
                ...dbConfig,
                poolMin: 2,         // Mínimo de conexiones inactivas en el pool
                poolMax: 10,        // Máximo de conexiones simultáneas
                poolIncrement: 1,   // Nuevas conexiones a abrir si se agotan
                poolTimeout: 60,    // Tiempo en segundos para liberar conexiones inactivas
                queueTimeout: 5000  // Tiempo máximo de espera en cola (5 segundos)
            });
            console.log('✅ Pool de conexiones de Oracle (Thin Mode) creado exitosamente.');
        }

        // Ejecutar prueba de conexión de manera tolerante a fallos
        try {
            await testConnection();
        } catch (testErr) {
            console.warn('⚠️ Advertencia: La prueba de conexión con la base de datos falló o no respondió a tiempo:', testErr.message);
        }
    } catch (err) {
        console.error('❌ Error crítico al crear el pool de conexiones en Thin Mode:', err);
        process.exit(1);
    }
}

/**
 * Método de prueba para verificar que la conexión responde ejecutando un query simple
 */
async function testConnection() {
    let connection;
    try {
        if (!pool) {
            throw new Error('El pool de conexiones no está inicializado.');
        }
        connection = await pool.getConnection();
        const result = await connection.execute(
            `SELECT TO_CHAR(sysdate, 'YYYY-MM-DD HH24:MI:SS') AS fecha FROM dual`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(`✅ Conexión de prueba exitosa (Thin Mode). Hora DB: ${result.rows[0].FECHA}`);
    } catch (err) {
        console.error('❌ La consulta de prueba en la base de datos falló:', err.message);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close(); // Liberar la conexión de vuelta al pool
            } catch (err) {
                console.error('Error cerrando la conexión del test:', err);
            }
        }
    }
}

/**
 * Ejecuta una consulta SQL utilizando una conexión del pool
 */
async function executeQuery(sql, binds = [], opts = { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }) {
    let connection;
    try {
        if (pool) {
            connection = await pool.getConnection();
        } else {
            // Fallback en caso de que se llame antes de inicializar el pool
            connection = await oracledb.getConnection(dbConfig);
        }
        const result = await connection.execute(sql, binds, opts);
        return result;
    } catch (err) {
        console.error('Error ejecutando query:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error cerrando conexión:', err);
            }
        }
    }
}

/**
 * Cierra el pool de conexiones limpiamente
 */
async function closePool() {
    if (pool) {
        try {
            await pool.close();
            console.log('Pool de conexiones cerrado de manera limpia.');
        } catch (err) {
            console.error('Error al cerrar el pool de conexiones:', err);
        }
    }
}

module.exports = {
    initialize,
    executeQuery,
    testConnection,
    closePool,
    dbConfig
};

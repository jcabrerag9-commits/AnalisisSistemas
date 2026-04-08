const oracledb = require('oracledb');
require('dotenv').config();

oracledb.fetchAsString = [oracledb.CLOB];

// Configuración de la base de datos
const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECTION_STRING
};

async function initialize() {
    try {
        console.log('Iniciando conexión a Oracle en modo Thin...');
        const connection = await oracledb.getConnection(dbConfig);
        console.log('Conexión exitosa a Oracle Database');
        await connection.close();
    } catch (err) {
        console.error('Error de conexión a la base de datos:', err);
        process.exit(1);
    }
}

async function executeQuery(sql, binds = [], opts = { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
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

module.exports = {
    initialize,
    executeQuery,
    dbConfig
};


const db = require('./db');

async function test() {
    try {
        await db.initialize();
        const sql = `INSERT INTO CON_USUARIO_ROL (USU_USUARIO, ROL_ROL) VALUES (:USU_USUARIO, :ROL_ROL)`;
        // Intenta insertar con IDs que probablemente existan (o no)
        const result = await db.executeQuery(sql, { USU_USUARIO: 1, ROL_ROL: 1 });
        console.log('Result:', result);
    } catch (err) {
        console.error('Error capturado:', err);
    }
}

test();

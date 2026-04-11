const db = require('../server/db.js');
async function run() {
    try {
        const p = await db.executeQuery("SELECT * FROM CON_PERIODO WHERE PER_AÑO = 2026 AND PER_MES = 12");
        console.log('Periodo 12:', p.rows);
        
        const e = await db.executeQuery("SELECT * FROM CON_ESTADO_ASIENTO");
        console.log('Estados de Asiento:', e.rows);
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();

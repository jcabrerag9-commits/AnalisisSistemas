const db = require('../server/db.js');
async function run() {
    try {
        const p = await db.executeQuery("SELECT LINE, TEXT FROM ALL_SOURCE WHERE NAME = 'SP_CIERRE_EJERCICIO_ANUAL' AND TYPE = 'PROCEDURE' ORDER BY LINE");
        p.rows.forEach(r => console.log(`${r.LINE}: ${r.TEXT.trim()}`));
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();

const db = require('../server/db.js');
async function run() {
    try {
        const sql = `SELECT ARGUMENT_NAME, DATA_TYPE, IN_OUT FROM USER_ARGUMENTS WHERE OBJECT_NAME = 'SP_EDITAR_ASIENTO' ORDER BY POSITION`;
        const res = await db.executeQuery(sql);
        console.log("SP_EDITAR_ASIENTO Arguments:");
        console.table(res.rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();

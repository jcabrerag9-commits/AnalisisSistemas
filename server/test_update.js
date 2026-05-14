
const db = require('./db');

async function testUpdate() {
    try {
        await db.initialize();
        const id = 41; // EUR
        const MON_CODIGO_ISO = 'EUR';
        const MON_NOMBRE = 'Euro (Editado)';
        const MON_SIMBOLO = '€';
        const sql = `UPDATE CON_MONEDA SET MON_CODIGO_ISO = :MON_CODIGO_ISO, MON_NOMBRE = :MON_NOMBRE, MON_SIMBOLO = :MON_SIMBOLO WHERE MON_MONEDA = :id`;
        const result = await db.executeQuery(sql, { MON_CODIGO_ISO, MON_NOMBRE, MON_SIMBOLO, id });
        console.log('Update Result:', result);
    } catch (err) {
        console.error('Update Error:', err);
    }
}

testUpdate();

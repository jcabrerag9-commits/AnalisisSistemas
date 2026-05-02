    const express = require('express');
const router = express.Router();
const reportesCtrl = require('../controllers/REPORTE_BALANCE');

router.get('/balance-general', reportesCtrl.getBalanceGeneral);

module.exports = router;
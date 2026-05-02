const express = require('express');
const router = express.Router();
const controller = require('../controllers/REPORTE_BALANCE');

router.get('/balance-general', controller.getBalanceGeneral);

module.exports = router;
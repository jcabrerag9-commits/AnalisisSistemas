const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/REPORTE_FLUJO_EFECTIVO');

router.get('/flujo-efectivo', controller.getFlujoEfectivo);

module.exports = router;
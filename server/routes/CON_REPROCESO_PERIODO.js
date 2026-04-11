const express = require('express');
const router = express.Router();
const controller = require('../controllers/CON_REPROCESO_PERIODO');

router.get('/buscar', controller.buscarPeriodo);
router.get('/historial', controller.obtenerHistorial);
router.post('/ejecutar', controller.ejecutarReproceso);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/REPORTE_DIARIO');

router.get('/libro-diario', controller.getLibroDiario);
router.get('/libro-diario/anios', controller.getAniosDisponibles);
router.get('/estado-resultados', controller.getEstadoResultados);

module.exports = router;

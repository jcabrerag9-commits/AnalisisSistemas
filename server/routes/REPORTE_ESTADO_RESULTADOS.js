const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/REPORTE_ESTADO_RESULTADOS');

router.get('/estado-resultados', controller.getEstadoResultados);

module.exports = router;
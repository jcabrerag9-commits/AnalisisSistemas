const express = require('express');
const router  = express.Router();
const controller = require('../controllers/REPORTE_BALANZA');

router.get('/balanza-comprobacion', controller.getBalanzaComprobacion);

module.exports = router;
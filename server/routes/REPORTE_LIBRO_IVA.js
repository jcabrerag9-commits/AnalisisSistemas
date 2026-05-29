const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/REPORTE_LIBRO_IVA');

router.get('/libro-iva', controller.getLibroIVA);

module.exports = router;
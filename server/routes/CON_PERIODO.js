
const express = require('express');
const router = express.Router();
const controller = require('../controllers/CON_PERIODO');

router.get('/anios', controller.getAniosDisponibles);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

router.post('/abrir', controller.abrirPeriodo);
router.post('/cerrar-mensual', controller.cerrarPeriodoMensual);
router.post('/cierre-anual', controller.cierreEjercicioAnual);

module.exports = router;

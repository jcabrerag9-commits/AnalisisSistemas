
const express = require('express');
const router = express.Router();
const controller = require('../controllers/CON_ASIENTO');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

router.post('/anular', controller.anular); // Ruta para anular un asiento

module.exports = router;

const express        = require('express');
const router         = express.Router();
const controller     = require('../controllers/CIERRE_ANUAL');
const authMiddleware = require('../Middleware/authMiddleware');

// Preview no modifica datos — GET sin restricción extra
router.get('/cierre-anual/preview', controller.getPreview);

// Ejecutar cierre — POST protegido, requiere JWT válido
router.post('/cierre-anual', authMiddleware, controller.ejecutarCierre);

module.exports = router;
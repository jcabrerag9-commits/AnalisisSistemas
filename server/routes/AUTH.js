const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AUTH');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login',  controller.login);
router.post('/logout', controller.logout);
router.get('/me',      authMiddleware, controller.me);

module.exports = router;
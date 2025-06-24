const express = require('express');
const router = express.Router();
const shomController = require('../controller/shomConttoller');

// Route pour SHOM - utilise '/shom' comme préfixe
router.use('/shom', shomController);

module.exports = router;
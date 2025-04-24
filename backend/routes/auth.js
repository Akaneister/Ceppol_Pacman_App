const express = require('express');
const router = express.Router();
const { login, getOperateurs } = require('../controller/authController');

// Route pour la connexion
router.post('/login', login);

// Route pour obtenir les opérateurs
router.get('/operateurs', getOperateurs);

module.exports = router;
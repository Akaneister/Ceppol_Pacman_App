//carte.js
const express = require('express');
const router = express.Router();

// Importation du contrôleur pour les lieux
const { getLieu } = require('../controller/carteController');

// Route pour récupérer les lieux
router.get('/', getLieu);

module.exports = router;

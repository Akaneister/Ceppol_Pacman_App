//carte.js
const express = require('express');
const router = express.Router();

// Importation du contrôleur pour les lieux
const { getRessource } = require('../controller/ressourceController.js');

// Route pour récupérer les lieux
router.get('/', getRessource);

module.exports = router;

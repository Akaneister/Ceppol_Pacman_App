//carte.js
const express = require('express');
const router = express.Router();

// Importation du contrôleur pour les lieux
const { getRessource } = require('../controller/ressourceController.js');
const { getLien } = require('../controller/ressourceController.js');

router.get('/', getRessource);
router.get('/lien', getLien);

module.exports = router;

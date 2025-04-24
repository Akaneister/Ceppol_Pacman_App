const express = require('express');
const router = express.Router();

// import depuis rapportController.js
const { testAPI, getAllRapports } = require('../controller/rapportController');

// import depuis ajouterRapportController.js
const {
  getTypeEvenement,
  getSousTypePollution,
  getOrigineEvenement,
  getTypeCible,
  getZoneGeographique,
  createRapport
} = require('../controller/ajouterRapportController');

// Routes GET
router.get('/test', testAPI);
router.get('/', getAllRapports);
router.get('/type-evenement', getTypeEvenement);
router.get('/sous-type-pollution', getSousTypePollution);
router.get('/origine-evenement', getOrigineEvenement);
router.get('/type-cible', getTypeCible);
router.get('/zone-geographique', getZoneGeographique);

// Routes POST
router.post('/', createRapport); // Ajout d’un rapport

module.exports = router;

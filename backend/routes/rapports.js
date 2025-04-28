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


// import depuis listeRapportController.js
const { 
  getRapport,
  getHistoriqueRapport,
  updateRapport,
  getOperateursAvecAcces,
  verifierDroitModification,
  ajouterAccesOperateur,
  supprimerAccesOperateur,
  getOperateurs,
} = require('../controller/listeRapportController');

// import middleware auth
const auth = require('../auth/checkRapportOwnership'); // ici ton middleware est auth

// Routes GET
router.get('/test', testAPI); 
router.get('/', getAllRapports); 
router.get('/type-evenement', getTypeEvenement);
router.get('/sous-type-pollution', getSousTypePollution);
router.get('/origine-evenement', getOrigineEvenement);
router.get('/type-cible', getTypeCible);
router.get('/zone-geographique', getZoneGeographique);
router.get('/operateurs', getOperateurs); // Route pour obtenir les opérateurs

// Routes POST
router.post('/', createRapport); 

// Routes pour la liste des rapports
router.get('/liste-rapports', getRapport);

// Routes pour la gestion des accès aux rapports
router.get('/:id/acces',  getOperateursAvecAcces);
router.post('/:id/acces', ajouterAccesOperateur);
router.delete('/:id/acces/:idOperateur',  supprimerAccesOperateur);

// Modifier un rapport
router.put('/rapports/:id',  updateRapport);

// EXPORT FINAL : seulement router !!
module.exports = router;

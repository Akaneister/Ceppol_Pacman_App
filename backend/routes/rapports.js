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

const { getRapportInfo } = require('../controller/rapportDetailsController');

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
  getDroit,
  ajouterEvenementHistorique,
} = require('../controller/listeRapportController');


const { updateRapportC } = require('../controller/modifierRapportController');

// import middleware auth
const auth = require('../auth/checkRapportOwnership'); // ici ton middleware est auth.

// Modifier un rapport
router.put('/:id',  updateRapport);
router.put('/:id/after',updateRapportC);

// Routes GET
router.get('/test', testAPI); 
router.get('/', getAllRapports); 
router.get('/type-evenement', getTypeEvenement);
router.get('/sous-type-pollution', getSousTypePollution);
router.get('/origine-evenement', getOrigineEvenement);
router.get('/type-cible', getTypeCible);
router.get('/zone-geographique', getZoneGeographique);
router.get('/operateurs', getOperateurs); // Route pour obtenir les opérateurs
router.get('/:id',getRapportInfo); // Route pour obtenir les détails d'un rapport)
router.get('/acces/all', getDroit); // Route pour obtenir les droits d'accès

// Routes POST
router.post('/', createRapport); 

// Routes pour la liste des rapports
router.get('/liste-rapports', getRapport);

// Routes pour la gestion des accès aux rapports
router.get('/:id/acces',  getOperateursAvecAcces);
router.post('/:id/acces', ajouterAccesOperateur);
router.delete('/:id/acces/:idOperateur',  supprimerAccesOperateur);

router.post('/historique', ajouterEvenementHistorique);
router.get('/historique/:id', getHistoriqueRapport);



// EXPORT FINAL : seulement router !!
module.exports = router;

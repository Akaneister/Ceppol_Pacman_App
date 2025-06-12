const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

// Gestion des documents
router.get('/documents', adminController.getDocuments);
router.post('/documents', adminController.addDocument);
router.delete('/documents/:id', adminController.deleteDocument);

// Archivage/désarchivage des rapports
router.post('/rapports/:id_rapport/archive', adminController.archiveRapport);
router.post('/rapports/:id_rapport/unarchive', adminController.unarchiveRapport);

// Changer le personnel d’astreinte
router.put('/astreinte', adminController.updateAstreinte);

// Mise à jour des champs de formulaire/menu déroulant (exemple pour TypeEvenement)
router.put('/type-evenement', adminController.updateTypeEvenement);
router.post('/type-evenement', adminController.addTypeEvenement);
router.delete('/type-evenement/:id_type_evenement', adminController.deleteTypeEvenement);

// Gestion des opérateurs d'astreinte
router.post('/operateurs', adminController.addOperateur); // Ajout de la route pour ajouter un opérateur
router.delete('/operateurs/:id_operateur', adminController.deleteOperateur);
router.put('/operateurs/:id_operateur', adminController.updateOperateur);

// À dupliquer pour les autres entités (SousTypeEvenement, TypeCible, ZoneGeographique, etc.)

module.exports = router;
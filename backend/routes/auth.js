const express = require('express');
const router = express.Router();
const { 
  login, 
  getOperateurs, 
  getAllPasswords, 
  addPassword, 
  deletePassword, 
  getStats 
} = require('../controller/authController');

// Route pour la connexion
router.post('/login', login);

// Route pour obtenir les opérateurs
router.get('/operateurs', getOperateurs);

// Routes admin pour les mots de passe
router.get('/passwords', getAllPasswords);
router.post('/passwords', addPassword);
router.delete('/passwords/:id', deletePassword);

// Route pour les statistiques
router.get('/stats', getStats);

module.exports = router;
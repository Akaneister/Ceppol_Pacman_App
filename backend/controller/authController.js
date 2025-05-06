
/*
authController.js
==================== Description ==================//

Description Global : Ce fichier contient les contrôleurs pour gérer les requêtes liées à l'authentification et à la récupération des opérateurs.
il inclut :
- Recupere le mot de passe pour la connexion.  A chiffrer par la suite car la il est en clair.
- Récupération des opérateurs. (Personne d'astreinte)

Ce controller va permettre de gere la connexion a l'application par un mot de passe et de selectionner l'operateur utiliser qui est d'astreinte.
*/




// =================== LOGIN =================== //
const db = require('../db');


// Fonction pour gérer la connexion
// Cette fonction est appelée lorsque l'utilisateur essaie de se connecter
/*
  - Elle récupère le mot de passe envoyé dans la requête.
  - Elle effectue une requête SQL pour vérifier si le mot de passe est correct.
  - Si le mot de passe est valide, elle renvoie un message d'accès autorisé.
  - Sinon, elle renvoie un message d'erreur.
*/
exports.login = (req, res) => {
  console.log("Requête de connexion reçue");
  const { motdepasse } = req.body;

  // Utilisation des Promises pour gérer la requête SQL
  db.query('SELECT * FROM MotDePasse WHERE mot_de_passe = ?', [motdepasse])
    .then(([results, fields]) => {  // Destructuration pour obtenir les résultats
      console.log("Résultats de la requête SQL:", results); // Afficher les résultats uniquement

      if (results.length === 0) {
        console.log("Mot de passe invalide");
        return res.status(401).json({ error: 'Mot de passe invalide' });
      }

      console.log("Accès autorisé, envoi de la réponse");
      return res.status(200).json({ message: 'Accès autorisé' });
    })
    .catch((err) => {
      console.error("Erreur SQL:", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    });
};



// =================== GET : Operateurs =================== //
/*
  - Cette fonction est appelée pour récupérer la liste des opérateurs.
  - Elle effectue une requête SQL pour obtenir tous les opérateurs de la base de données.
  - Si la requête réussit, elle renvoie la liste des opérateurs.
  - Sinon, elle renvoie un message d'erreur.
*/
exports.getOperateurs = (req, res) => {
  // Utilisation des Promises pour la requête SQL
  db.query('SELECT * FROM Operateur')
    .then((result) => {
      console.log('Opérateurs récupérés:', result);
      return res.status(200).json({
        success: true,
        message: "Opérateurs récupérés avec succès",
        data: result
      });
    })
    .catch((err) => {
      console.error('Erreur dans getOperateurs:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    });
};
/*
authController.js
==================== Description ==================//

Description Global : Ce fichier contient les contrôleurs pour gérer les requêtes liées à l'authentification et à la récupération des opérateurs.
il inclut :
- Recupere le mot de passe pour la connexion.  A chiffrer par la suite car la il est en clair.
- Récupération des opérateurs. (Personne d'astreinte)
- Gestion des sessions Admin avec mot de passe spécifique

Ce controller va permettre de gere la connexion a l'application par un mot de passe et de selectionner l'operateur utiliser qui est d'astreinte.
*/

// =================== LOGIN =================== //
const db = require('../db');

// Fonction pour gérer la connexion
// Cette fonction est appelée lorsque l'utilisateur essaie de se connecter
/*
  - Elle récupère le mot de passe envoyé dans la requête.
  - Elle effectue une requête SQL pour vérifier si le mot de passe est correct.
  - Si le mot de passe est valide, elle renvoie un message d'accès autorisé avec le type d'utilisateur.
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
        return res.status(401).json({ 
          success: false,
          error: 'Mot de passe invalide' 
        });
      }

      // Récupérer les informations du mot de passe
      const motDePasseInfo = results[0];
      console.log("Informations du mot de passe:", motDePasseInfo);

      // Vérifier le type d'utilisateur selon le champ 'info'
      const typeUtilisateur = motDePasseInfo.info;
      
      if (typeUtilisateur === 'Admin') {
        console.log("Connexion Admin autorisée");
        return res.status(200).json({ 
          success: true,
          message: 'Accès autorisé',
          type: 'Admin',
          info: 'Admin',
          userType: 'admin'
        });
      } else {
        console.log("Connexion Opérateur autorisée");
        return res.status(200).json({ 
          success: true,
          message: 'Accès autorisé',
          type: 'Operateur',
          info: 'Operateur',
          userType: 'operateur'
        });
      }
    })
    .catch((err) => {
      console.error("Erreur SQL:", err);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur serveur' 
      });
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

// =================== ADMIN ROUTES =================== //

// Fonction pour récupérer tous les mots de passe (Admin seulement)
exports.getAllPasswords = (req, res) => {
  db.query('SELECT id_motdepasse, mot_de_passe, date_creation, date_modification, info FROM MotDePasse ORDER BY date_creation DESC')
    .then(([results, fields]) => {
      console.log('Mots de passe récupérés pour admin:', results.length);
      return res.status(200).json({
        success: true,
        message: "Mots de passe récupérés avec succès",
        data: results
      });
    })
    .catch((err) => {
      console.error('Erreur dans getAllPasswords:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur serveur' 
      });
    });
};

// Fonction pour ajouter un nouveau mot de passe (Admin seulement)
exports.addPassword = (req, res) => {
  const { mot_de_passe, info } = req.body;
  
  if (!mot_de_passe || !info) {
    return res.status(400).json({
      success: false,
      error: 'Mot de passe et type requis'
    });
  }

  const query = 'INSERT INTO MotDePasse (mot_de_passe, info, date_creation, date_modification) VALUES (?, ?, NOW(), NOW())';
  
  db.query(query, [mot_de_passe, info])
    .then(([result]) => {
      console.log('Nouveau mot de passe ajouté:', result.insertId);
      return res.status(201).json({
        success: true,
        message: "Mot de passe ajouté avec succès",
        data: { id: result.insertId }
      });
    })
    .catch((err) => {
      console.error('Erreur dans addPassword:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur serveur' 
      });
    });
};

// Fonction pour supprimer un mot de passe (Admin seulement)
exports.deletePassword = (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM MotDePasse WHERE id_motdepasse = ?', [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Mot de passe non trouvé'
        });
      }
      
      console.log('Mot de passe supprimé:', id);
      return res.status(200).json({
        success: true,
        message: "Mot de passe supprimé avec succès"
      });
    })
    .catch((err) => {
      console.error('Erreur dans deletePassword:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur serveur' 
      });
    });
};

// Fonction pour récupérer les statistiques (Admin seulement)
exports.getStats = (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_passwords FROM MotDePasse',
    'SELECT COUNT(*) as total_operateurs FROM Operateur',
    'SELECT COUNT(*) as admin_passwords FROM MotDePasse WHERE info = "Admin"',
    'SELECT COUNT(*) as operateur_passwords FROM MotDePasse WHERE info = "Operateur"'
  ];

  Promise.all(queries.map(query => db.query(query)))
    .then(results => {
      const stats = {
        totalPasswords: results[0][0][0].total_passwords,
        totalOperateurs: results[1][0][0].total_operateurs,
        adminPasswords: results[2][0][0].admin_passwords,
        operateurPasswords: results[3][0][0].operateur_passwords
      };

      return res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats
      });
    })
    .catch((err) => {
      console.error('Erreur dans getStats:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur serveur' 
      });
    });
};
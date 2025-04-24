
// =================== LOGIN =================== //
const db = require('../db');

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
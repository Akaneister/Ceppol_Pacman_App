/*
rapportDetailsController.js

==================== Description ==================//
Description global : Ce fichier contient le controller pour la route de details d'un rapport.

il inclut :
- getRapportInfo : permet de voir les details d'un rapport grace a son id


Permet de recupere les details d'un rapport specifique grace a son id 
*/

const db = require('../db');

//permet de voir les details d'un rapport grace a son id

const getRapportInfo = async (req, res) => {
  const id_rapport = req.params.id;

  if (!id_rapport) {
    return res.status(400).json({ error: "L'ID du rapport est manquant dans l'URL" });
  }

  try {
    // Connexion DB
    const connection = await db.getConnection();

    const [rapport] = await connection.query(
      `SELECT * FROM Rapport WHERE id_rapport = ?`, [id_rapport]
    );
    if (rapport.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    const [cible] = await connection.query(
      `SELECT * FROM Cible WHERE id_rapport = ?`, [id_rapport]
    );

    const [typeCible] = await connection.query(
      `SELECT tc.libelle
        FROM Cible c
        JOIN TypeCible tc ON c.id_type_cible = tc.id_type_cible
        WHERE c.id_rapport = ?`, [id_rapport]
    );

    const [lieu] = await connection.query(
      `SELECT * FROM Lieu WHERE id_rapport = ?`, [id_rapport]
    );

    const [meteo] = await connection.query(
      `SELECT * FROM Meteo WHERE id_rapport = ?`, [id_rapport]
    );

    const [alerte] = await connection.query(
      `SELECT * FROM Alerte WHERE id_rapport = ?`, [id_rapport]
    );

    const [acces] = await connection.query(
      `SELECT * FROM AccesRapport WHERE id_rapport = ?`, [id_rapport]
    );

    connection.release();

    res.json({
      rapport: rapport[0],
      metaData: {
        cible: cible[0] || null,
        typeCible: typeCible[0] || null,
        localisation: lieu[0] || null,
        meteo: meteo[0] || null,
        alertes: alerte[0] || null,
        acces: acces || []
      }
    });

  } catch (err) {
    console.error('Erreur lors de la récupération du rapport:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};



module.exports = {
  getRapportInfo,
};
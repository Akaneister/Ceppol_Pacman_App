/*
rapportController.js
==================== Description ==================//

Description global :ce contient des fonction basique pour la gestion des rapports et aussi un test pour voir si l'API fonctionne

elle inclut :
- testAPI : un test pour voir si l'API fonctionne
- getAllRapports : pour recuperer tous les rapports
- createRapport : pour creer un rapport

*/


const db = require('../db');

exports.testAPI = (req, res) => {
  res.send('✅ API rapport OK');
};


exports.getAllRapports = async (req, res) => {
  try {
    const queryParams = [];

    let query = `
      SELECT DISTINCT 
  r.*, 
  t.libelle AS type_evenement,
  st.libelle AS sous_type_evenement,
  o.libelle AS origine_evenement,
  z.nom_zone AS zone_geographique,
  op.nom AS operateur_nom,
  op.prenom AS operateur_prenom,
  (
    SELECT GROUP_CONCAT(DISTINCT ar.id_operateur)
    FROM AccesRapport ar
    WHERE ar.id_rapport = r.id_rapport
  ) AS operateurs_acces,
  l.details_lieu,
  l.latitude,
  l.longitude,
  m.direction_vent,
  m.force_vent,
  m.etat_mer,
  m.nebulosite,
  a.cedre,
  a.cross_contact,
  a.smp,
  a.bsaa,
  a.delai_appareillage_bsaa,
  a.polrep,
  a.message_polrep,
  a.photo,
  a.derive_mothym,
  a.pne
FROM Rapport r
LEFT JOIN TypeEvenement t ON r.id_type_evenement = t.id_type_evenement
LEFT JOIN SousTypeEvenement st ON r.id_sous_type_evenement = st.id_sous_type_evenement
LEFT JOIN OrigineEvenement o ON r.id_origine_evenement = o.id_origine_evenement
LEFT JOIN Operateur op ON r.id_operateur = op.id_operateur
LEFT JOIN Lieu l ON r.id_rapport = l.id_rapport
LEFT JOIN ZoneGeographique z ON l.id_zone = z.id_zone
LEFT JOIN Meteo m ON r.id_rapport = m.id_rapport
LEFT JOIN Alerte a ON r.id_rapport = a.id_rapport
WHERE 1 = 1

    `;

    // Filtres dynamiques
    if (req.query.id_type_evenement) {
      query += ' AND r.id_type_evenement = ?';
      queryParams.push(req.query.id_type_evenement);
    }

    if (req.query.id_sous_type_evenement) {
      query += ' AND r.id_sous_type_evenement = ?';
      queryParams.push(req.query.id_sous_type_evenement);
    }

    if (req.query.id_origine_evenement) {
      query += ' AND r.id_origine_evenement = ?';
      queryParams.push(req.query.id_origine_evenement);
    }

    if (req.query.id_zone) {
      query += ' AND r.id_zone = ?';
      queryParams.push(req.query.id_zone);
    }

    if (req.query.date_debut) {
      query += ' AND r.date_evenement >= ?';
      queryParams.push(req.query.date_debut);
    }

    if (req.query.date_fin) {
      query += ' AND r.date_evenement <= ?';
      queryParams.push(req.query.date_fin);
    }

    query += ' ORDER BY r.date_evenement DESC';

    const [result] = await db.query(query, queryParams);

    // Nettoyage et formatage
    const rapports = result.map(rapport => ({
      ...rapport,
      operateurs_acces: rapport.operateurs_acces
        ? rapport.operateurs_acces.split(',').map(id => parseInt(id))
        : []
    }));

    res.status(200).json(rapports);
  } catch (err) {
    console.error("Erreur lors de la récupération des rapports:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};





exports.createRapport = (req, res) => {
  const { titre, date_rapport, description, id_operateur } = req.body;

  db.query(
    'INSERT INTO Rapport (titre, date_rapport, description, id_operateur) VALUES (?, ?, ?, ?)',
    [titre, date_rapport, description, id_operateur],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id_rapport: result.insertId });
    }
  );
};

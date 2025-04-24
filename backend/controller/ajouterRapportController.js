const db = require('../db');

//=================== Requêtes GET ===================//
// Utilise async/await pour la gestion des requêtes

const getTypeEvenement = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM TypeEvenement');
    res.json(result);
  } catch (err) {
    console.error('Erreur dans getTypeEvenement:', err);  // Log l'erreur détaillée
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};


const getSousTypePollution = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM SousTypeEvenement');
    res.json(result);
  } catch (err) {
    console.error('Erreur dans getTypeEvenement:', err);  // Log l'erreur détaillée
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getOrigineEvenement = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM OrigineEvenement');
    res.json(result);
  } catch (err) {
    console.error('Erreur dans getTypeEvenement:', err);  // Log l'erreur détaillée
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getTypeCible = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM TypeCible');
    res.json(result);
  } catch (err) {
    console.error('Erreur dans getTypeEvenement:', err);  // Log l'erreur détaillée
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getZoneGeographique = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM ZoneGeographique');
    res.json(result);
  } catch (err) {
    console.error('Erreur dans getTypeEvenement:', err);  // Log l'erreur détaillée
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

//==================== Requête POST ===================//
const createRapport = async (req, res) => {
  console.log('Requête reçue pour créer un rapport'); // Log de début
  console.log('Requête reçue:', req.body);

  const {
    titre,
    date_evenement,
    description_globale,
    id_operateur,
    id_type_evenement,
    id_sous_type_evenement,
    id_origine_evenement,
    alerte,
    lieu,
    meteo
  } = req.body;

  if (!titre || !date_evenement || !id_operateur || !id_type_evenement) {
    console.log('Champs requis manquants');
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const connection = await db.getConnection();

  try {
    console.log('Début de la transaction');
    await connection.beginTransaction();

    console.log('Insertion dans la table Rapport');
    const [rapportResult] = await connection.query(
      `INSERT INTO Rapport (titre, date_evenement, description_globale, id_operateur, id_type_evenement, id_sous_type_evenement, id_origine_evenement)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titre,
        new Date(date_evenement),
        description_globale || null,
        id_operateur,
        id_type_evenement,
        id_sous_type_evenement || null,
        id_origine_evenement || null
      ]
    );
    console.log('Rapport inséré avec succès:', rapportResult);

    const id_rapport = rapportResult.insertId;
    console.log('ID du rapport:', id_rapport);

    if (alerte) {
      console.log('Insertion dans la table Alerte');
      await connection.query(
        `INSERT INTO Alerte (id_rapport, cedre, cross_contact, spm, bsaa, delai_appareillage_bsaa, polrep, message_polrep, photo, derive_mothym, pne)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_rapport,
          alerte.cedre || null,
          alerte.cross_contact || null,
          alerte.spm || null,
          alerte.bsaa || null,
          alerte.delai_appareillage_bsaa || null,
          alerte.polrep || null,
          alerte.message_polrep || null,
          alerte.photo || null,
          alerte.derive_mothym || null,
          alerte.pne || null
        ]
      );
      console.log('Alerte insérée avec succès');
    }

    if (lieu) {
      console.log('Insertion dans la table Lieu');
      await connection.query(
        `INSERT INTO Lieu (id_rapport, details_lieu, latitude, longitude, id_zone)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_rapport,
          lieu.details_lieu || null,
          lieu.latitude || null,
          lieu.longitude || null,
          lieu.id_zone || null
        ]
      );
      console.log('Lieu inséré avec succès');
    }

    if (meteo) {
      console.log('Insertion dans la table Meteo');
      await connection.query(
        `INSERT INTO Meteo (id_rapport, direction_vent, force_vent, etat_mer, nebulosite)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_rapport,
          meteo.direction_vent || null,
          meteo.force_vent || null,
          meteo.etat_mer || null,
          meteo.nebulosite || null
        ]
      );
      console.log('Météo insérée avec succès');
    }

    console.log('Commit des changements');
    await connection.commit();

    res.status(201).json({ message: 'Rapport ajouté avec succès', id_rapport });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du rapport:', err);
    await connection.rollback();
    res.status(500).json({ error: "Erreur lors de l'ajout du rapport" });
  } finally {
    connection.release();
    console.log('Connexion libérée');
  }
};





//==================== Exports ===================//
module.exports = {
  getTypeEvenement,
  getSousTypePollution,
  getOrigineEvenement,
  getTypeCible,
  getZoneGeographique,
  createRapport
};

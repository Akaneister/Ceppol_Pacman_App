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

  // Extraire les données du corps de la requête
  const { rapport, metaData } = req.body;

  // Vérification des champs obligatoires
  if (!rapport.titre || !rapport.date_evenement || !rapport.id_operateur || !rapport.id_type_evenement) {
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
        rapport.titre,
        new Date(rapport.date_evenement), // Conversion en objet Date
        rapport.description_globale || null,
        rapport.id_operateur,
        rapport.id_type_evenement,
        rapport.id_sous_type_evenement || null,
        rapport.id_origine_evenement || null,
      ]
    );
    console.log('Rapport inséré avec succès:', rapportResult);

    const id_rapport = rapportResult.insertId;

    // Insertion dans la table Cible si des données sont présentes
    if (metaData.cible && (metaData.cible.nom_cible || metaData.cible.id_cible)) {
      console.log('Insertion dans la table Cible');
      await connection.query(
        `INSERT INTO Cible (id_rapport, nom, pavillon, id_type_cible)
         VALUES (?, ?, ?, ?)`,
        [
          id_rapport,
          metaData.cible.nom_cible || null,
          metaData.cible.pavillon_cible || null,
          metaData.cible.id_cible || null,
        ]
      );
      console.log('Cible insérée avec succès');
    }

    // Insertion dans la table Lieu si des données sont présentes
    if (metaData.localisation) {
      console.log('Insertion dans la table Lieu');
      await connection.query(
        `INSERT INTO Lieu (id_rapport, details_lieu, latitude, longitude, id_zone)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_rapport,
          metaData.localisation.details_lieu || null,
          metaData.localisation.latitude || null,
          metaData.localisation.longitude || null,
          metaData.localisation.id_zone || null,
        ]
      );
      console.log('Lieu inséré avec succès');
    }

    // Insertion dans la table Meteo si des données sont présentes
    if (metaData.meteo) {
      console.log('Insertion dans la table Meteo');
      await connection.query(
        `INSERT INTO Meteo (id_rapport, direction_vent, force_vent, etat_mer, nebulosite)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_rapport,
          metaData.meteo.direction_vent || null,
          metaData.meteo.force_vent || null,
          metaData.meteo.etat_mer || null,
          metaData.meteo.nebulosite || null,
        ]
      );
      console.log('Météo insérée avec succès');
    }

    // Insertion dans la table Alerte si des données sont présentes
    if (metaData.alertes) {
      const alertes = metaData.alertes;
      console.log('Insertion dans la table Alerte');
      await connection.query(
        `INSERT INTO Alerte (id_rapport, cedre, cross_contact, smp, bsaa, delai_appareillage_bsaa, polrep, message_polrep, photo, derive_mothym, pne)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_rapport,
          alertes.cedre_alerte ? 1 : 0,
          alertes.cross_alerte ? 1 : 0,
          alertes.smp ? 1 : 0,
          alertes.bsaa ? 1 : 0,
          alertes.delai_appareillage ? new Date(alertes.delai_appareillage) : null,
          alertes.polrep ? 1 : 0,
          null, // message_polrep n'est pas fourni dans les données
          alertes.photo ? 1 : 0,
          alertes.derive_mothy ? 1 : 0,
          alertes.polmar_terre ? 1 : 0,
        ]
      );
      console.log('Alerte insérée avec succès');
    }

    // Ajout de l'accès pour l'opérateur dans la table AccesRapport
    console.log('Insertion dans la table AccesRapport');
    await connection.query(
      `INSERT INTO AccesRapport (id_rapport, id_operateur, peut_modifier, date_attribution)
       VALUES (?, ?, ?, NOW())`,
      [
        id_rapport,
        rapport.id_operateur,
        true, // L'opérateur a le droit de modifier
      ]
    );
    console.log('Accès ajouté avec succès');

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

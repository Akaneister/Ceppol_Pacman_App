/*
modifierRapportController.js
==================== Description ==================//

Description globale : ce fichier contient le code qui permet la mise a jour d'un rapport et des autres tables associées

elle inclut :
- la mise à jour du rapport principal

Ce controller permet de gere si un operateur met a jour ou ajoute une information sur un rapport
*/

const db = require('../db');


//=================== Requêtes Put ===================//
const updateRapportC = async (req, res) => {
  console.log('Requête reçue pour mise à jour du rapport');

  const { id } = req.params;
  const { rapport, metaData } = req.body;

  // Vérification des champs requis
  if (!id || !rapport.titre || !rapport.date_evenement || !rapport.id_operateur || !rapport.id_type_evenement) {
    console.log('Erreur : Champs requis manquants ou ID absent');
    return res.status(400).json({ error: "Champs requis manquants ou ID absent" });
  }

  const connection = await db.getConnection();

  try {
    console.log('Vérification des droits de modification');
    const [accessRows] = await connection.query(
      `SELECT peut_modifier FROM AccesRapport WHERE id_rapport = ? AND id_operateur = ?`,
      [id, rapport.id_operateur]
    );

    if (accessRows.length === 0 || !accessRows[0].peut_modifier) {
      console.log('Erreur : Droits insuffisants pour modifier ce rapport');
      return res.status(403).json({ error: "Droits insuffisants pour modifier ce rapport" });
    }

    await connection.beginTransaction();
    console.log('Droits vérifiés, début de la mise à jour du rapport');

    // Mise à jour du rapport principal
    console.log('Mise à jour du rapport');
    const updateRapportResult = await connection.query(
      `UPDATE Rapport SET titre = ?, date_evenement = ?, description_globale = ?, id_type_evenement = ?, id_sous_type_evenement = ?, id_origine_evenement = ?, archive = ?
   WHERE id_rapport = ?`,
      [
        rapport.titre,
        new Date(rapport.date_evenement),
        rapport.description_globale || null,
        rapport.id_type_evenement,
        rapport.id_sous_type_evenement || null,
        rapport.id_origine_evenement || null,
        rapport.archive || 0,
        id
      ]
    );
    console.log('Résultat de la mise à jour du rapport:', updateRapportResult);


    // Mise à jour ou insertion dans Cible
    if (metaData.cible) {
      console.log('Mise à jour de la Cible');
      // Vérifier si une entrée Cible existe déjà pour ce rapport
      const [existingCible] = await connection.query(
        `SELECT * FROM Cible WHERE id_rapport = ?`,
        [id]
      );

      if (existingCible.length > 0) {
        // Mise à jour de l'entrée existante
        await connection.query(
          `UPDATE Cible SET nom = ?, pavillon = ?, id_type_cible = ?
           WHERE id_rapport = ?`,
          [
            metaData.cible.nom_cible || null,
            metaData.cible.pavillon_cible || null,
            metaData.cible.id_cible || null,
            id
          ]
        );
      } else {
        // Insertion d'une nouvelle entrée
        await connection.query(
          `INSERT INTO Cible (id_rapport, nom, pavillon, id_type_cible)
           VALUES (?, ?, ?, ?)`,
          [
            id,
            metaData.cible.nom_cible || null,
            metaData.cible.pavillon_cible || null,
            metaData.cible.id_cible || null,
          ]
        );
      }
      console.log('Mise à jour de Cible terminée');
    }

    // Mise à jour ou insertion dans Lieu
    if (metaData.localisation) {
      console.log('Mise à jour de la localisation');

      // Vérifier si une entrée Lieu existe déjà pour ce rapport
      const [existingLieu] = await connection.query(
        `SELECT id_lieu FROM Lieu WHERE id_rapport = ?`,
        [id]
      );

      if (existingLieu.length > 0) {
        // Mise à jour de l'entrée existante
        await connection.query(
          `UPDATE Lieu SET details_lieu = ?, latitude = ?, longitude = ?, id_zone = ?
           WHERE id_rapport = ?`,
          [
            metaData.localisation.details_lieu || null,
            metaData.localisation.latitude || null,
            metaData.localisation.longitude || null,
            metaData.localisation.id_zone || null,
            id
          ]
        );
        console.log('Lieu existant mis à jour, id:', existingLieu[0].id_lieu);
      } else {
        // Insertion d'une nouvelle entrée
        const [insertResult] = await connection.query(
          `INSERT INTO Lieu (id_rapport, details_lieu, latitude, longitude, id_zone)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            metaData.localisation.details_lieu || null,
            metaData.localisation.latitude || null,
            metaData.localisation.longitude || null,
            metaData.localisation.id_zone || null,
          ]
        );
        console.log('Nouveau lieu créé, id:', insertResult.insertId);
      }
    }

    // Mise à jour ou insertion dans Météo
    if (metaData.meteo) {
      console.log('Mise à jour des données Météo');
      // Vérifier si une entrée Meteo existe déjà pour ce rapport
      const [existingMeteo] = await connection.query(
        `SELECT * FROM Meteo WHERE id_rapport = ?`,
        [id]
      );

      if (existingMeteo.length > 0) {
        // Mise à jour de l'entrée existante
        await connection.query(
          `UPDATE Meteo SET direction_vent = ?, force_vent = ?, etat_mer = ?, nebulosite = ?
           WHERE id_rapport = ?`,
          [
            metaData.meteo.direction_vent || null,
            metaData.meteo.force_vent || null,
            metaData.meteo.etat_mer || null,
            metaData.meteo.nebulosite || null,
            id
          ]
        );
      } else {
        // Insertion d'une nouvelle entrée
        await connection.query(
          `INSERT INTO Meteo (id_rapport, direction_vent, force_vent, etat_mer, nebulosite)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            metaData.meteo.direction_vent || null,
            metaData.meteo.force_vent || null,
            metaData.meteo.etat_mer || null,
            metaData.meteo.nebulosite || null,
          ]
        );
      }
      console.log('Mise à jour de Meteo terminée');
    }

    // Mise à jour ou insertion dans Alerte
    if (metaData.alertes) {
      console.log('Mise à jour des alertes');
      // Vérifier si une entrée Alerte existe déjà pour ce rapport
      const [existingAlerte] = await connection.query(
        `SELECT * FROM Alerte WHERE id_rapport = ?`,
        [id]
      );

      if (existingAlerte.length > 0) {
        // Mise à jour de l'entrée existante
        await connection.query(
          `UPDATE Alerte SET cedre = ?, cross_contact = ?, smp = ?, bsaa = ?, 
           delai_appareillage_bsaa = ?, polrep = ?, message_polrep = ?, photo = ?, 
           derive_mothym = ?, pne = ?
           WHERE id_rapport = ?`,
          [
            metaData.alertes.cedre_alerte ? 1 : 0,
            metaData.alertes.cross_alerte ? 1 : 0,
            metaData.alertes.smp ? 1 : 0,
            metaData.alertes.bsaa ? 1 : 0,
            metaData.alertes.delai_appareillage ? new Date(metaData.alertes.delai_appareillage) : null,
            metaData.alertes.polrep ? 1 : 0,
            null, // message_polrep
            metaData.alertes.photo ? 1 : 0,
            metaData.alertes.derive_mothy ? 1 : 0,
            metaData.alertes.polmar_terre ? 1 : 0,
            id
          ]
        );
      } else {
        // Insertion d'une nouvelle entrée
        await connection.query(
          `INSERT INTO Alerte (id_rapport, cedre, cross_contact, smp, bsaa, delai_appareillage_bsaa, 
           polrep, message_polrep, photo, derive_mothym, pne)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            metaData.alertes.cedre_alerte ? 1 : 0,
            metaData.alertes.cross_alerte ? 1 : 0,
            metaData.alertes.smp ? 1 : 0,
            metaData.alertes.bsaa ? 1 : 0,
            metaData.alertes.delai_appareillage ? new Date(metaData.alertes.delai_appareillage) : null,
            metaData.alertes.polrep ? 1 : 0,
            null, // message_polrep
            metaData.alertes.photo ? 1 : 0,
            metaData.alertes.derive_mothy ? 1 : 0,
            metaData.alertes.polmar_terre ? 1 : 0,
          ]
        );
      }
      console.log('Mise à jour des alertes terminée');
    }

    await connection.commit();
    console.log('Mise à jour terminée avec succès');
    res.status(200).json({ message: 'Rapport mis à jour avec succès' });
  } catch (err) {
    await connection.rollback();
    console.error('Erreur lors de la mise à jour du rapport:', err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du rapport" });
  } finally {
    connection.release();
    console.log('Connexion libérée');
  }
};






module.exports = {
  updateRapportC,
};
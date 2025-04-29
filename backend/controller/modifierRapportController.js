const db = require('../db');


//=================== Requêtes Put ===================//

//modification d'un rapport
const updateRapportC = async (req, res) => {
    console.log('Requête reçue pour mise à jour du rapport');
    const { id } = req.params;
    const { rapport, metaData } = req.body;
  
    if (!id || !rapport.titre || !rapport.date_evenement || !rapport.id_operateur || !rapport.id_type_evenement) {
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
        return res.status(403).json({ error: "Droits insuffisants pour modifier ce rapport" });
      }
  
      await connection.beginTransaction();
  
      console.log('Mise à jour du rapport');
      await connection.query(
        `UPDATE Rapport SET titre = ?, date_evenement = ?, description_globale = ?, id_type_evenement = ?, id_sous_type_evenement = ?, id_origine_evenement = ?
         WHERE id_rapport = ?`,
        [
          rapport.titre,
          new Date(rapport.date_evenement),
          rapport.description_globale || null,
          rapport.id_type_evenement,
          rapport.id_sous_type_evenement || null,
          rapport.id_origine_evenement || null,
          id
        ]
      );
  
      // Mise à jour ou insertion dans Cible
      if (metaData.cible) {
        await connection.query(
          `REPLACE INTO Cible (id_rapport, nom, pavillon, id_type_cible)
           VALUES (?, ?, ?, ?)`,
          [
            id,
            metaData.cible.nom_cible || null,
            metaData.cible.pavillon_cible || null,
            metaData.cible.id_cible || null,
          ]
        );
      }
  
      // Mise à jour ou insertion dans Lieu
      if (metaData.localisation) {
        await connection.query(
          `REPLACE INTO Lieu (id_rapport, details_lieu, latitude, longitude, id_zone)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            metaData.localisation.details_lieu || null,
            metaData.localisation.latitude || null,
            metaData.localisation.longitude || null,
            metaData.localisation.id_zone || null,
          ]
        );
      }
  
      // Mise à jour ou insertion dans Météo
      if (metaData.meteo) {
        await connection.query(
          `REPLACE INTO Meteo (id_rapport, direction_vent, force_vent, etat_mer, nebulosite)
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
  
      // Mise à jour ou insertion dans Alerte
      if (metaData.alertes) {
        await connection.query(
          `REPLACE INTO Alerte (id_rapport, cedre, cross_contact, smp, bsaa, delai_appareillage_bsaa, polrep, message_polrep, photo, derive_mothym, pne)
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
  
      await connection.commit();
      res.status(200).json({ message: 'Rapport mis à jour avec succès' });
    } catch (err) {
      await connection.rollback();
      console.error('Erreur lors de la mise à jour du rapport:', err);
      res.status(500).json({ error: "Erreur lors de la mise à jour du rapport" });
    } finally {
      connection.release();
    }
  };
  

module.exports = {
  updateRapportC,
};
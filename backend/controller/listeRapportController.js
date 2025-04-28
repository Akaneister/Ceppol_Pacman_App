const db = require('../db');



//=================== Requêtes GET ===================//

// Fonction modifiée pour récupérer les rapports avec les informations d'accès
const getRapport = async (req, res) => {
    try {
      const id_operateur = req.user?.id_operateur;
      
      // Construire la requête de base
      let query = `
        SELECT r.*, 
               (SELECT GROUP_CONCAT(ra.id_operateur) 
                FROM AccesRapport ra 
                WHERE ra.id_rapport = r.id_rapport) as operateurs_acces
        FROM Rapport r
      `;
      
      // Ajouter les filtres si présents
      const whereConditions = [];
      const queryParams = [];
      
      // Ajouter les filtres existants
      if (req.query.id_type_evenement) {
        whereConditions.push('r.id_type_evenement = ?');
        queryParams.push(req.query.id_type_evenement);
      }
      
      if (req.query.id_sous_type_evenement) {
        whereConditions.push('r.id_sous_type_evenement = ?');
        queryParams.push(req.query.id_sous_type_evenement);
      }
      
      if (req.query.id_origine_evenement) {
        whereConditions.push('r.id_origine_evenement = ?');
        queryParams.push(req.query.id_origine_evenement);
      }
      
      if (req.query.id_zone) {
        whereConditions.push('r.id_zone = ?');
        queryParams.push(req.query.id_zone);
      }
      
      if (req.query.date_debut) {
        whereConditions.push('r.date_evenement >= ?');
        queryParams.push(req.query.date_debut);
      }
      
      if (req.query.date_fin) {
        whereConditions.push('r.date_evenement <= ?');
        queryParams.push(req.query.date_fin);
      }
      
      // Assembler la requête finale
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      query += ' ORDER BY r.date_evenement DESC';
      
      // Exécuter la requête
      const [result] = await db.query(query, queryParams);
      
      // Transformer les chaînes d'opérateurs en tableaux
      const rapportsWithAccess = result.map(rapport => {
        if (rapport.operateurs_acces) {
          rapport.operateurs_acces = rapport.operateurs_acces.split(',').map(id => parseInt(id));
        } else {
          rapport.operateurs_acces = [];
        }
        return rapport;
      });
      
      res.json(rapportsWithAccess);
    } catch (err) {
      console.error("Erreur lors de la récupération des rapports:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };


  //fonction pour recupere les operateurs
  const getOperateurs = async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM Operateur');
        res.json(result);
    } catch (err) {
        console.error('Erreur dans getOperateurs:', err);  // Log l'erreur détaillée
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
  



//Ajouter les info de modification
const getHistoriqueRapport = async (req, res) => {
    try {
        const { id } = req.params; // Récupérer l'ID du rapport depuis les paramètres de la requête
        const [result] = await db.query('SELECT * FROM Historique WHERE id_rapport = ?', [id]);
        res.json(result);
    } catch (err) {
        console.error('Erreur dans getHistoriqueRapport:', err);  // Log l'erreur détaillée
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
// Récupérer les opérateurs ayant accès à un rapport
const getOperateursAvecAcces = async (req, res) => {
    const { id } = req.params;
    
    // Vérifier si l'ID du rapport est présent dans les paramètres
    if (!id) {
      console.log("Erreur : ID du rapport manquant");
      return res.status(400).json({ error: "ID du rapport manquant" });
    }
    
    try {
      // Récupérer les opérateurs ayant accès au rapport depuis la table d'association
      const [operateurs] = await db.query(`
        SELECT o.id_operateur, o.nom, o.prenom
        FROM Operateur o
        JOIN AccesRapport ra ON o.id_operateur = ra.id_operateur
        WHERE ra.id_rapport = ?
      `, [id]);
      
      // Vérifier si des opérateurs ont été trouvés
      if (operateurs.length === 0) {
        return res.status(404).json({ error: "Aucun opérateur n'a accès à ce rapport" });
      }
      
      res.json(operateurs); // Répondre avec la liste des opérateurs ayant accès
    } catch (err) {
      console.error("Erreur lors de la récupération des opérateurs avec accès:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
  

  // Fonction pour vérifier si un utilisateur a le droit de modifier un rapport
const verifierDroitModification = async (req, res, next) => {
    const { id } = req.params;
    const id_operateur = req.user.id_operateur; // Supposons que l'ID de l'opérateur connecté est dans req.user
    
    if (!id || !id_operateur) {
      return res.status(400).json({ error: "ID du rapport ou de l'opérateur manquant" });
    }
    
    try {
      // Vérifier si l'utilisateur est le propriétaire du rapport
      const [rapport] = await db.query(`
        SELECT id_operateur FROM Rapport WHERE id_rapport = ?
      `, [id]);
      
      if (rapport.length === 0) {
        return res.status(404).json({ error: "Rapport non trouvé" });
      }
      
      // Si l'utilisateur est le propriétaire, autoriser l'accès
      if (rapport[0].id_operateur === id_operateur) {
        return next();
      }
      
      // Sinon, vérifier s'il a un accès spécifique
      const [acces] = await db.query(`
        SELECT * FROM AccesRapport 
        WHERE id_rapport = ? AND id_operateur = ?
      `, [id, id_operateur]);
      
      if (acces.length === 0) {
        return res.status(403).json({ error: "Vous n'avez pas les droits pour modifier ce rapport" });
      }
      
      // L'utilisateur a un accès, autoriser la modification
      next();
    } catch (err) {
      console.error("Erreur lors de la vérification des droits:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
  

//=================== Requêtes PUT ===================//


// Modification de updateRapport pour inclure l'ID de l'opérateur qui modifie
const updateRapport = async (req, res) => {
    console.log('Requête reçue pour modifier un rapport');
    console.log('Requête reçue:', req.body);
  
    const { id_rapport, rapport, metaData } = req.body;
    const id_operateur_modification = req.user.id_operateur; // L'opérateur qui fait la modification
  
    // Vérification que l'ID du rapport est présent
    if (!id_rapport) {
      console.log('ID du rapport manquant');
      return res.status(400).json({ error: "ID du rapport manquant" });
    }
  
    const connection = await db.getConnection();
  
    try {
      console.log('Début de la transaction');
      await connection.beginTransaction();
  
      console.log('Mise à jour de la table Rapport');
      await connection.query(
        `UPDATE Rapport
         SET titre = ?, date_evenement = ?, description_globale = ?, id_type_evenement = ?, 
             id_sous_type_evenement = ?, id_origine_evenement = ?, id_operateur_modification = ?, date_modification = NOW()
         WHERE id_rapport = ?`,
        [
          rapport.titre,
          new Date(rapport.date_evenement),
          rapport.description_globale || null,
          rapport.id_type_evenement,
          rapport.id_sous_type_evenement || null,
          rapport.id_origine_evenement || null,
          id_operateur_modification,
          id_rapport
        ]
      );
      console.log('Rapport mis à jour avec succès');
  
      // Mise à jour de la table Cible
      if (metaData.cible && (metaData.cible.nom_cible || metaData.cible.id_cible)) {
        console.log('Mise à jour de la table Cible');
        await connection.query(
          `UPDATE Cible
           SET nom = ?, pavillon = ?, id_type_cible = ?
           WHERE id_rapport = ?`,
          [
            metaData.cible.nom_cible || null,
            metaData.cible.pavillon_cible || null,
            metaData.cible.id_cible || null,
            id_rapport
          ]
        );
        console.log('Cible mise à jour avec succès');
      }
  
      // Mise à jour de la table Lieu
      if (metaData.localisation) {
        console.log('Mise à jour de la table Lieu');
        await connection.query(
          `UPDATE Lieu
           SET details_lieu = ?, latitude = ?, longitude = ?, id_zone = ?
           WHERE id_rapport = ?`,
          [
            metaData.localisation.details_lieu || null,
            metaData.localisation.latitude || null,
            metaData.localisation.longitude || null,
            metaData.localisation.id_zone_geographique || null,
            id_rapport
          ]
        );
        console.log('Lieu mis à jour avec succès');
      }
  
      // Mise à jour de la table Meteo
      if (metaData.meteo) {
        console.log('Mise à jour de la table Meteo');
        await connection.query(
          `UPDATE Meteo
           SET direction_vent = ?, force_vent = ?, etat_mer = ?, nebulosite = ?
           WHERE id_rapport = ?`,
          [
            metaData.meteo.direction_vent || null,
            metaData.meteo.force_vent || null,
            metaData.meteo.etat_mer || null,
            metaData.meteo.nebulosite || null,
            id_rapport
          ]
        );
        console.log('Météo mise à jour avec succès');
      }
  
      // Mise à jour de la table Alerte
      if (metaData.alertes) {
        console.log('Mise à jour de la table Alerte');
        await connection.query(
          `UPDATE Alerte
           SET cedre = ?, cross_contact = ?, smp = ?, bsaa = ?, delai_appareillage_bsaa = ?, polrep = ?, photo = ?, derive_mothym = ?, pne = ?
           WHERE id_rapport = ?`,
          [
            metaData.alertes.cedre_alerte ? 1 : 0,
            metaData.alertes.cross_alerte ? 1 : 0,
            metaData.alertes.smp ? 1 : 0,
            metaData.alertes.bsaa ? 1 : 0,
            metaData.alertes.delai_appareillage ? new Date(metaData.alertes.delai_appareillage) : null,
            metaData.alertes.polrep ? 1 : 0,
            metaData.alertes.photo ? 1 : 0,
            metaData.alertes.derive_mothy ? 1 : 0,
            metaData.alertes.polmar_terre ? 1 : 0,
            id_rapport
          ]
        );
        console.log('Alerte mise à jour avec succès');
      }
  
      // Ajouter une entrée dans l'historique des modifications
      await connection.query(
        `INSERT INTO Historique (id_rapport, id_operateur, date_modification, type_modification)
         VALUES (?, ?, NOW(), 'MODIFICATION')`,
        [id_rapport, id_operateur_modification]
      );
      console.log('Historique mis à jour avec succès');
  
      console.log('Commit des changements');
      await connection.commit();
  
      res.status(200).json({ message: 'Rapport mis à jour avec succès' });
    } catch (err) {
      console.error('Erreur lors de la modification du rapport:', err);
      await connection.rollback();
      res.status(500).json({ error: "Erreur lors de la modification du rapport" });
    } finally {
      connection.release();
      console.log('Connexion libérée');
    }
  };
  

  //=================== Fonction Post  ===================//
  const ajouterAccesOperateur = async (req, res) => {
    const { id } = req.params; // ID du rapport
    const { id_operateur, peut_modifier } = req.body; // ID de l'opérateur et si il peut modifier ou non
    
    if (!id || !id_operateur || typeof peut_modifier === 'undefined') {
      console.log('Erreur : ID du rapport, ID de l\'opérateur ou valeur de "peut_modifier" manquants');
      return res.status(400).json({ error: "ID du rapport, ID de l'opérateur ou 'peut_modifier' manquant" });
    }
  
    try {
      // Vérifier si l'accès existe déjà dans la table AccesRapport
      const [existingAccess] = await db.query(`
        SELECT * FROM AccesRapport 
        WHERE id_rapport = ? AND id_operateur = ?
      `, [id, id_operateur]);
  
      if (existingAccess.length > 0) {
        console.log('Erreur : Cet opérateur a déjà accès au rapport');
        return res.status(409).json({ error: "Cet opérateur a déjà accès au rapport" });
      }
      
      // Ajouter l'accès dans la table AccesRapport avec la colonne `peut_modifier`
      console.log('Ajout de l\'accès à la table AccesRapport...');
      await db.query(`
        INSERT INTO AccesRapport (id_rapport, id_operateur, peut_modifier, date_attribution)
        VALUES (?, ?, ?, NOW())
      `, [id, id_operateur, peut_modifier]);
  
      console.log('Accès ajouté avec succès');
  
      res.status(201).json({ message: "Accès ajouté avec succès" });
    } catch (err) {
      console.error("Erreur lors de l'ajout d'accès:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };
  
  


  //==================== Fonction Delete  ===================//
  
// Fonction pour supprimer un accès
const supprimerAccesOperateur = async (req, res) => {
    const { id, idOperateur } = req.params;
    
    if (!id || !idOperateur) {
      return res.status(400).json({ error: "ID du rapport ou de l'opérateur manquant" });
    }
    
    try {
      // Supprimer l'accès
      await db.query(`
        DELETE FROM AccesRapport 
        WHERE id_rapport = ? AND id_operateur = ?
      `, [id, idOperateur]);
      
      res.json({ message: "Accès supprimé avec succès" });
    } catch (err) {
      console.error("Erreur lors de la suppression d'accès:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  };


  //==================== Exportation des fonctions ===================//

  module.exports = {
    getRapport,
    getHistoriqueRapport,
    updateRapport,
    getOperateursAvecAcces,
    verifierDroitModification,
    ajouterAccesOperateur,
    supprimerAccesOperateur,
    getOperateurs,
  };
const db = require('../db');

// 1. Gestion des documents (Ressource)
async function getDocuments(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM Ressource');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addDocument(req, res) {
    const { nom, chemin, type } = req.body;
    try {
        await db.query('INSERT INTO Ressource (nom, chemin, type) VALUES (?, ?, ?)', [nom, chemin, type]);
        res.status(201).json({ message: 'Document ajouté' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteDocument(req, res) {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Ressource WHERE id = ?', [id]);
        res.json({ message: 'Document supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 2. Archivage/désarchivage des main courante (Rapport)
async function archiveRapport(req, res) {
    const { id_rapport } = req.params;
    try {
        await db.query('UPDATE Rapport SET archive = 1 WHERE id_rapport = ?', [id_rapport]);
        res.json({ message: 'Rapport archivé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function unarchiveRapport(req, res) {
    const { id_rapport } = req.params;
    try {
        await db.query('UPDATE Rapport SET archive = 0 WHERE id_rapport = ?', [id_rapport]);
        res.json({ message: 'Rapport désarchivé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 3. Changer le personnel d'astreinte (Operateur)
async function updateAstreinte(req, res) {
    const { id_operateur, id_motdepasse } = req.body;
    console.log(`[updateAstreinte] Reçu: id_operateur=${id_operateur}, id_motdepasse=${id_motdepasse}`);
    try {
        const [result] = await db.query(
            'UPDATE Operateur SET id_motdepasse = ? WHERE id_operateur = ?',
            [id_motdepasse, id_operateur]
        );
        console.log(`[updateAstreinte] Résultat de la requête:`, result);
        res.json({ message: 'Personnel dastreinte mis à jour' });
    } catch (err) {
        console.error(`[updateAstreinte] Erreur:`, err);
        res.status(500).json({ error: err.message });
    }
}

// Supprimer un opérateur d'astreinte
async function deleteOperateur(req, res) {
    const { id_operateur } = req.params;
    
    // Validation de l'ID
    if (!id_operateur) {
        return res.status(400).json({ error: 'ID opérateur manquant' });
    }
    
    try {
        console.log(`[deleteOperateur] Tentative de suppression de l'opérateur ID: ${id_operateur}`);
        
        // Vérifier si l'opérateur existe avant de le supprimer
        const [existing] = await db.query('SELECT * FROM Operateur WHERE id_operateur = ?', [id_operateur]);
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Opérateur non trouvé' });
        }
        
        // Supprimer l'opérateur
        const [result] = await db.query('DELETE FROM Operateur WHERE id_operateur = ?', [id_operateur]);
        
        console.log(`[deleteOperateur] Résultat:`, result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Opérateur non trouvé' });
        }
        
        res.json({ 
            message: 'Opérateur supprimé avec succès',
            affectedRows: result.affectedRows 
        });
        
    } catch (err) {
        console.error(`[deleteOperateur] Erreur:`, err);
        res.status(500).json({ error: err.message });
    }
}

// Modifier un opérateur d'astreinte
async function updateOperateur(req, res) {
    const { id_operateur } = req.params;
    const { nom, prenom } = req.body; // Suppression de email
    
    // Validation de l'ID
    if (!id_operateur) {
        return res.status(400).json({ error: 'ID opérateur manquant' });
    }
    
    // Validation des données
    if (!nom || !prenom) {
        return res.status(400).json({ error: 'Le nom et le prénom sont requis' });
    }
    
    try {
        console.log(`[updateOperateur] Mise à jour opérateur ID: ${id_operateur}`, { nom, prenom });
        
        // Vérifier si l'opérateur existe
        const [existing] = await db.query('SELECT * FROM Operateur WHERE id_operateur = ?', [id_operateur]);
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Opérateur non trouvé' });
        }
        
        // Mettre à jour l'opérateur (sans email)
        const [result] = await db.query(
            'UPDATE Operateur SET nom = ?, prenom = ? WHERE id_operateur = ?',
            [nom.trim(), prenom.trim(), id_operateur]
        );
        
        console.log(`[updateOperateur] Résultat:`, result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Opérateur non trouvé' });
        }
        
        // Récupérer l'opérateur mis à jour pour la réponse
        const [updated] = await db.query('SELECT * FROM Operateur WHERE id_operateur = ?', [id_operateur]);
        
        res.json({ 
            message: 'Opérateur mis à jour avec succès',
            operator: updated[0],
            affectedRows: result.affectedRows 
        });
        
    } catch (err) {
        console.error(`[updateOperateur] Erreur:`, err);
        res.status(500).json({ error: err.message });
    }
}

// Ajouter un opérateur d'astreinte
async function addOperateur(req, res) {
    const { nom, prenom } = req.body;

    // Validation des données
    if (!nom || !prenom) {
        return res.status(400).json({ error: 'Le nom et le prénom sont requis' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO Operateur (nom, prenom) VALUES (?, ?)',
            [nom.trim(), prenom.trim()]
        );
        res.status(201).json({
            message: 'Opérateur ajouté avec succès',
            id_operateur: result.insertId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 4. Mise à jour des champs de formulaire/menu déroulant (TypeEvenement, SousTypeEvenement, TypeCible, ZoneGeographique, etc.)
async function updateTypeEvenement(req, res) {
    const { id_type_evenement, libelle } = req.body;
    try {
        await db.query('UPDATE TypeEvenement SET libelle = ? WHERE id_type_evenement = ?', [libelle, id_type_evenement]);
        res.json({ message: 'Type d\'événement mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addTypeEvenement(req, res) {
    const { libelle } = req.body;
    try {
        await db.query('INSERT INTO TypeEvenement (libelle) VALUES (?)', [libelle]);
        res.status(201).json({ message: 'Type d\'événement ajouté' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteTypeEvenement(req, res) {
    const { id_type_evenement } = req.params;
    try {
        await db.query('DELETE FROM TypeEvenement WHERE id_type_evenement = ?', [id_type_evenement]);
        res.json({ message: 'Type d\'événement supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// À dupliquer pour SousTypeEvenement, TypeCible, ZoneGeographique, etc.

module.exports = {
    getDocuments,
    addDocument,
    deleteDocument,
    archiveRapport,
    unarchiveRapport,
    updateAstreinte,
    updateTypeEvenement,
    addTypeEvenement,
    deleteTypeEvenement,
    deleteOperateur,
    updateOperateur,
    addOperateur // Ajout de l'export
    // Ajouter ici les autres exports pour les autres entités à gérer dynamiquement
};
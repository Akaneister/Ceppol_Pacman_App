/*
carteController.js
==================== Description ==================//

Description Global : Ce fichier contient les contrôleurs pour gérer les requêtes liées à la carte.

elle inclut :
- getLieu : Récupère tous les lieux de la base de données.
*/


const db = require('../db');

const getLieu = async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM Lieu');
        res.json(result);
    } catch (err) {
        console.error('Erreur dans getLieu:', err);  // Log l'erreur détaillée
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = {
    getLieu,
};


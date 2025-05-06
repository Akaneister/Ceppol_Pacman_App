/*
ressourceController.js

==================== Description ==================//
Description Global : ce controller permet de recupere les informations de la table Ressource

il inclut :
- getRessource : permet de recuperer toutes les ressources de la table Ressource

Va permetttre d'afficher les ressources importantes sur la page d'accueil
*/

const db = require('../db');


const getRessource = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Ressource');
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
    }
    


module.exports = {
    getRessource,
}
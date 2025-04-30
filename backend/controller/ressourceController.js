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
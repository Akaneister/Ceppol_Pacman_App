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


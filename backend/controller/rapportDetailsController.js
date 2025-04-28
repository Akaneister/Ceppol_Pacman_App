const db = require('../db');

//permet de voir les details d'un rapport grace a son id

const getRapportInfo = async (req, res) => {
  const id_rapport = req.params.id;  // Utiliser 'id' et non 'id_rapport'
  console.log('ID du rapport:', id_rapport);  // Log l'ID du rapport pour le débogage

  if (!id_rapport) {
    return res.status(400).json({ error: "L'ID du rapport est manquant dans l'URL" });
  }

  try {
    const [result] = await db.query('SELECT * FROM Rapport WHERE id_rapport = ?', [id_rapport]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }
    res.json(result[0]);  // Retourne le rapport trouvé
  } catch (err) {
    console.error('Erreur dans getRapport:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};


module.exports = {
    getRapportInfo,
    };
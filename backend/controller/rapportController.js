const db = require('../db');

exports.testAPI = (req, res) => {
  res.send('✅ API rapport OK');
};

exports.getAllRapports = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Rapport');
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.createRapport = (req, res) => {
  const { titre, date_rapport, description, id_operateur } = req.body;

  db.query(
    'INSERT INTO Rapport (titre, date_rapport, description, id_operateur) VALUES (?, ?, ?, ?)',
    [titre, date_rapport, description, id_operateur],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id_rapport: result.insertId });
    }
  );
};

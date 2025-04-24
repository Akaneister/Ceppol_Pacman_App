const mysql = require('mysql2/promise');  // Assurez-vous d'utiliser mysql2 avec promesses
require('dotenv').config();

// Créer une connexion en utilisant le pool avec mysql2/promise
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Vérification de la connexion à la base de données
db.getConnection()
  .then(() => {
    console.log('📦 MySQL connecté');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion MySQL:', err);
  });

module.exports = db;

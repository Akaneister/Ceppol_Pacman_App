// File: backend/server.js
// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

// Initialisation de l'application Express
const app = express();

app.use(express.json());

// Middleware global
app.use(cors());

// Importation des routes
const rapportRoutes = require('./routes/rapports');
const authRoutes = require('./routes/auth');
const carteRoutes = require('./routes/carte'); // Importation de la route pour la carte
const ressourceRoutes = require('./routes/home'); // Importation de la route pour les ressources
const adminRoutes = require('./routes/admin');

// Définition des routes
// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// app.use('/api/lieu', carteRoutes ); // Route pour obtenir les lieux

// Routes des rapports
app.use('/api/rapports', rapportRoutes);

app.use('/api/ressources', ressourceRoutes); // Route pour obtenir les ressources

app.use('/api/lieu', carteRoutes); // Route pour la carte

app.use('/api/viewressources', express.static('ressources'));


// Route de test pour la connexion à la base de données
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            console.error('Erreur connexion DB 🔴:', err);
            return res.status(500).json({ connected: false, error: err });
        }
        console.log('Connexion DB OK ✅');
        res.json({ connected: true, result: results[0].result });
    });
});

// Démarrage du serveur
app.listen(process.env.PORT, () => {
    console.log(`🚀 Serveur backend sur le port ${process.env.PORT}`);
});

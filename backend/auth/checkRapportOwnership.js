const db = require('../db'); // adapte le chemin si besoin

async function checkRapportOwnership(req, res, next) {
    const id_rapport = req.params.id;
    const id_operateur = req.user.id_operateur;

    // Affiche les valeurs reçues dans la requête
    console.log('ID du rapport:', id_rapport);
    console.log('ID de l\'opérateur:', id_operateur);

    if (!id_rapport || !id_operateur) {
        // Si l'un des paramètres manque, log l'erreur
        console.log('Erreur : ID du rapport ou ID de l\'opérateur manquant.');
        return res.status(400).json({ error: "ID du rapport ou ID de l'opérateur manquant" });
    }

    try {
        // Affiche avant d'interroger la base de données
        console.log('Requête SQL pour récupérer le rapport avec l\'ID:', id_rapport);
        
        // Récupérer les informations du rapport
        const [rapport] = await db.query('SELECT id_operateur FROM Rapport WHERE id_rapport = ?', [id_rapport]);

        // Affiche les résultats de la requête
        console.log('Résultats de la requête SQL:', rapport);

        if (rapport.length === 0) {
            // Si aucun rapport n'est trouvé, log l'erreur
            console.log('Erreur : Rapport non trouvé.');
            return res.status(404).json({ error: "Rapport non trouvé" });
        }

        if (rapport[0].id_operateur !== id_operateur) {
            // Si l'opérateur ne correspond pas, log l'erreur
            console.log('Erreur : L\'opérateur n\'a pas les droits sur ce rapport.');
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à gérer les accès de ce rapport" });
        }

        // Si tout est bon, passe à la suite
        console.log('Propriétaire vérifié, accès autorisé.');
        next();
    } catch (err) {
        // En cas d'erreur survenue lors de la requête ou autre
        console.error('Erreur lors de la vérification du propriétaire:', err);
        res.status(500).json({ error: "Erreur serveur" });
    }
}

module.exports = checkRapportOwnership;

/**
 * ==================================================================================
 *                              COMPOSANT HOME - PAGE D'ACCUEIL
 * ==================================================================================
 * 
 * @file Home.js
 * @location frontend/src/components/pages/Home.js
 * @description Composant principal de la page d'accueil de l'application MarineV3
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • Affichage du tableau de bord utilisateur personnalisé
 * • Récupération et affichage des ressources disponibles depuis l'API
 * • Regroupement automatique des ressources par type/catégorie
 * • Gestion des états de chargement, d'erreur et de succès
 * • Animations fluides avec Framer Motion pour l'expérience utilisateur
 * • Authentification et affichage des informations utilisateur
 * 
 * STRUCTURE DU COMPOSANT :
 * ────────────────────────────────────────────────────────────────────────────────
 * • En-tête : Titre "Tableau de bord" + Informations utilisateur
 * • Contenu principal : Liste des ressources organisées par catégories
 * • Gestion d'état : Loading, Error, ou Success avec animations
 * 
 * DÉPENDANCES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • React (hooks: useState, useEffect)
 * • AuthContext (gestion de l'authentification)
 * • Framer Motion (animations et transitions)
 * • Composants enfants : ResourceCategory, Loading, ErrorMessage
 * 
 * API UTILISÉE :
 * ────────────────────────────────────────────────────────────────────────────────
 * • GET /ressources - Récupération de toutes les ressources disponibles
 * 
 * @author Oscar Vieujean 
 * ==================================================================================
 */

// Importation des hooks React pour la gestion d'état et des effets de bord
import { useEffect, useState } from 'react';
// Hook personnalisé pour la gestion de l'authentification
import { useAuth } from '../context/AuthContext';
// Composants pour l'affichage des états de l'application
import Loading from './Home/Loading';
import ErrorMessage from './Home/ErrorMessage';
// Bibliothèque d'animation pour des transitions fluides
import { motion, AnimatePresence } from 'framer-motion';
// Styles CSS spécifiques à la page d'accueil
import '../css/home.css';

// Récupère l'URL de base de l'API depuis les variables d'environnement
const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Fonction utilitaire pour obtenir l'icône appropriée selon l'extension du fichier
 * @param {string} chemin - Le chemin du fichier
 * @returns {string} L'emoji correspondant au type de fichier
 */
const getFileIcon = (chemin) => {
  if (!chemin) return '📄';
  const ext = chemin.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📕', doc: '📘', docx: '📘', xls: '📊',
    xlsx: '📊', ppt: '📙', pptx: '📙', txt: '📝',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
    zip: '🗜️', rar: '🗜️'
  };
  return icons[ext] || '📄';
};

/**
 * Composant principal de la page d'accueil
 * Affiche le tableau de bord avec les ressources disponibles
 * Gère l'authentification et l'affichage des données
 */
const Home = () => {
  // Récupération des données d'authentification depuis le contexte
  const { authData } = useAuth();

  // États locaux pour la gestion des données et de l'interface
  const [ressources, setRessources] = useState([]); // Liste des ressources
  const [loading, setLoading] = useState(true); // État de chargement
  const [error, setError] = useState(null); // Gestion des erreurs

  // Effet de bord pour charger les ressources au montage du composant
  useEffect(() => {
    /**
     * Fonction asynchrone pour récupérer les ressources depuis l'API
     * Gère les états de chargement et d'erreur
     */
    const fetchRessources = async () => {
      try {
        // Appel API pour récupérer les ressources
        const response = await fetch(`${API_BASE_URL}/ressources`);
        if (!response.ok) throw new Error('Erreur serveur');

        // Conversion de la réponse en JSON
        const data = await response.json();
        setRessources(data); // Mise à jour des ressources
        setError(null); // Réinitialisation des erreurs
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les ressources.");
      } finally {
        // Fin du chargement dans tous les cas (succès ou erreur)
        setLoading(false);
      }
    };

    fetchRessources();
  }, []); // Tableau de dépendances vide = exécution uniquement au montage

  /**
   * Tri des ressources par ID
   * Utilise la méthode sort pour organiser les ressources par ordre croissant d'ID
   */
  const sortedRessources = ressources.sort((a, b) => {
    const idA = parseInt(a.id) || 0; // Conversion en nombre, 0 par défaut
    const idB = parseInt(b.id) || 0;
    return idA - idB; // Tri croissant
  });

  return (
    // Conteneur principal avec animation d'entrée
    <motion.div
      className="home-container"
      initial={{ opacity: 0, y: 30 }} // État initial : transparent et décalé vers le bas
      animate={{ opacity: 1, y: 0 }} // État final : opaque et en position normale
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }} // Configuration de l'animation avec courbe de Bézier personnalisée
    >
      {/* Titre principal avec animation retardée */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }} // Décalé vers le haut initialement
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }} // Délai réduit pour effet séquentiel plus fluide
      >
        Tableau de bord
      </motion.h1>

      {/* Informations utilisateur avec animation latérale */}
      <motion.div
        className="user-info"
        initial={{ opacity: 0, x: -30 }} // Décalé vers la gauche
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span>Bonjour <strong>{authData.selectedOperateur}</strong></span>
      </motion.div>

      <main className="home-content">
        {/* 
          AnimatePresence permet des transitions fluides entre différents états
          mode="wait" attend que l'animation de sortie soit terminée avant de démarrer l'animation d'entrée
        */}
        <AnimatePresence mode="wait">
          {loading ? (
            // État de chargement : affichage du composant Loading
            <motion.div
              key="loading" // Clé unique pour AnimatePresence
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} // Animation de sortie
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Loading />
            </motion.div>
          ) : error ? (
            // État d'erreur : affichage du message d'erreur
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9, y: 10 }} // Légère réduction de taille initiale avec mouvement vertical
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ErrorMessage message={error} />
            </motion.div>
          ) : (
            // État normal : affichage des ressources
            <motion.div
              className="resources-container"
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Titre de la section ressources */}
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Ressources disponibles (triées par ID)
              </motion.h2>

              {/* Vérification de l'existence de ressources */}
              {sortedRessources.length === 0 ? (
                // Aucune ressource trouvée
                <motion.p
                  className="no-resources"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Aucune ressource disponible.
                </motion.p>
              ) : (
                // Affichage des ressources sous forme de liste triée par ID
                <motion.div
                  className="resources-list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {sortedRessources.map((ressource, idx) => (
                    <motion.a
                      key={ressource.id}
                      href={`${API_BASE_URL}/viewressources/${ressource.chemin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-item resource-item-link"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      // Délai progressif pour chaque élément (effet de cascade)
                      transition={{ delay: 0.4 + idx * 0.05, duration: 0.3 }}
                      whileHover={{
                        scale: 1.12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: { duration: 0.1 } 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="resource-icon">{getFileIcon(ressource.chemin)}</div>
                      <div className="resource-info">
                        <span className="resource-id">#{ressource.id}</span>
                        <span className="resource-name">{ressource.nom || ressource.name || 'Sans nom'}</span>
                        <span className="resource-type">{ressource.type || 'Non défini'}</span>
                      </div>
                      {ressource.description && (
                        <div className="resource-description">
                          {ressource.description}
                        </div>
                      )}
                      {ressource.dateCreation && (
                        <div className="resource-date">
                          Ajouté le: {new Date(ressource.dateCreation).toLocaleDateString()}
                        </div>
                      )}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default Home;

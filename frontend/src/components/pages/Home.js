import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResourceCategory from './Home/ResourceCategory';
import Loading from './Home/Loading';
import ErrorMessage from './Home/ErrorMessage';
import { motion, AnimatePresence } from 'framer-motion'; // Ajout de framer-motion
import '../css/home.css';

// Récupère l'URL de base de l'API depuis les variables d'environnement
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const { authData } = useAuth();
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRessources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ressources`);
        if (!response.ok) throw new Error('Erreur serveur');
        const data = await response.json();
        setRessources(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les ressources.");
      } finally {
        setLoading(false);
      }
    };

    fetchRessources();
  }, []);

  const ressourcesByType = ressources.reduce((acc, res) => {
    const type = res.type || 'Autre';
    acc[type] = acc[type] || [];
    acc[type].push(res);
    return acc;
  }, {});

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Tableau de bord
      </motion.h1>
      <motion.div
        className="user-info"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span>Bonjour <strong>{authData.selectedOperateur}</strong></span>
      </motion.div>

      <main className="home-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loading />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ErrorMessage message={error} />
            </motion.div>
          ) : (
            <motion.div
              className="resources-container"
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Ressources disponibles
              </motion.h2>
              {Object.keys(ressourcesByType).length === 0 ? (
                <motion.p
                  className="no-resources"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Aucune ressource disponible.
                </motion.p>
              ) : (
                Object.entries(ressourcesByType).map(([type, items], idx) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                  >
                    <ResourceCategory type={type} items={items} apiUrl={API_BASE_URL} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default Home;

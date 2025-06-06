
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResourceCategory from './Home/ResourceCategory';
import Loading from './Home/Loading';
import ErrorMessage from './Home/ErrorMessage';
import '../css/home.css';

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
    <div className="home-container">
      <h1>Tableau de bord</h1>
      <div className="user-info">
        <span>Bonjour <strong>{authData.selectedOperateur}</strong></span>
      </div>

      <main className="home-content">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="resources-container">
            <h2>Ressources disponibles</h2>
            {Object.keys(ressourcesByType).length === 0 ? (
              <p className="no-resources">Aucune ressource disponible.</p>
            ) : (
              Object.entries(ressourcesByType).map(([type, items]) => (
                <ResourceCategory key={type} type={type} items={items} apiUrl={API_BASE_URL} />
              ))
            )}
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} - Portail des ressources</p>
      </footer>
    </div>
  );
};

export default Home;

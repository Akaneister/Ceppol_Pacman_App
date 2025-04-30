import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/home.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const HomePage = () => {
  const { authData, logout } = useAuth();
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRessources = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/ressources`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des ressources');
        }
        const data = await response.json();
        setRessources(data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des ressources :', error);
        setError("Impossible de charger les ressources. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchRessources();
  }, []);

  // Grouper les ressources par type
  const ressourcesByType = ressources.reduce((acc, ressource) => {
    const type = ressource.type || 'Autre';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(ressource);
    return acc;
  }, {});

  // Déterminer l'icône en fonction du type de fichier
  const getFileIcon = (chemin) => {
    if (!chemin) return '📄';
    const extension = chemin.split('.').pop().toLowerCase();
    
    const icons = {
      pdf: '📕',
      doc: '📘',
      docx: '📘',
      xls: '📊',
      xlsx: '📊',
      ppt: '📙',
      pptx: '📙',
      txt: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '🗜️',
      rar: '🗜️'
    };
    
    return icons[extension] || '📄';
  };

  return (
    <div className="home-container">
      
        <h1>Tableau de bord</h1>
        <div className="user-info">
          <span>Bonjour  <strong>{authData.selectedOperateur}</strong></span>
          
        </div>
   

      <main className="home-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des ressources...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        ) : (
          <div className="resources-container">
            <h2>Ressources disponibles</h2>
            
            {Object.keys(ressourcesByType).length === 0 ? (
              <p className="no-resources">Aucune ressource disponible pour le moment.</p>
            ) : (
              Object.entries(ressourcesByType).map(([type, items]) => (
                <div key={type} className="resource-category">
                  <h3 className="category-title">{type}</h3>
                  <div className="resource-grid">
                    {items.map((res) => (
                      <div key={res.id} className="resource-card">
                        <div className="resource-icon">{getFileIcon(res.chemin)}</div>
                        <div className="resource-details">
                          <a 
                            href={`${API_BASE_URL}/viewressources/${res.chemin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="resource-link"
                          >
                            {res.nom}
                          </a>
                          {res.description && <p className="resource-description">{res.description}</p>}
                          {res.dateCreation && (
                            <p className="resource-date">Ajouté le: {new Date(res.dateCreation).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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

export default HomePage;
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

import axios from 'axios';
//import '../css/ModifierRapport.css';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ModifierRapport = () => {
  const { id } = useParams(); // récupère l'id depuis l'URL
  const navigate = useNavigate();
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRapport = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rapports/${id}`);
        setRapport(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du rapport:", err);
        setError('Impossible de charger le rapport.');
        setLoading(false);
      }
    };

    fetchRapport();
  }, [id]);

  const handleChange = (e) => {
    setRapport({ ...rapport, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/rapports/${id}`, rapport);
      navigate('/liste-rapports'); // Redirige après modification
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour du rapport.");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!rapport) return <p>Rapport introuvable.</p>;

  return (
    <div>
      <h2>Modifier le rapport #{id}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Titre:</label>
          <input 
            type="text" 
            name="titre" 
            value={rapport.titre || ''} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea 
            name="description" 
            value={rapport.description || ''} 
            onChange={handleChange}
            required
          />
        </div>

        {/* Ajoute d'autres champs ici selon ta base de données */}

        <button type="submit">Enregistrer les modifications</button>
      </form>
    </div>
  );
};

export default ModifierRapport;

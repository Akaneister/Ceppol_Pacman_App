import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Carte = () => {
  const [points, setPoints] = useState([]); // Liste des points à afficher
  const mapRef = useRef(null); // Référence pour la carte
  const mapContainerRef = useRef(null); // Référence pour le container de la carte

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Fonction pour récupérer les points depuis l'API
  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lieu`); // Utilise l'URL avec le BASE_URL et /api/lieu
      setPoints(response.data); // Mettre à jour les points récupérés
    } catch (error) {
      console.error('Erreur lors de la récupération des points:', error);
    }
  };

  // Initialiser la carte et ajouter les marqueurs
  useEffect(() => {
    // Initialiser la carte uniquement si le container existe et que la carte n'est pas encore initialisée
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([43.3, 5.4], 10); // Centrer la carte

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Effectuer la récupération des points au montage du composant
    fetchPoints();

    return () => {
      // Cleanup de la carte lorsque le composant est démonté
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [API_BASE_URL]); // La récupération des points n'est effectuée qu'une fois lors du montage du composant

  // Ajouter les marqueurs une fois que les points sont récupérés
  useEffect(() => {
    if (mapRef.current && points.length > 0) {
      // Ajout des marqueurs pour chaque point récupéré
      points.forEach(point => {
        const { latitude, longitude, name } = point;

        // Ajouter un marqueur pour chaque point
        L.marker([latitude, longitude]).addTo(mapRef.current)
          .bindPopup(`<b>${name}</b><br/>Latitude: ${latitude}<br/>Longitude: ${longitude}`)
          .openPopup();
      });
    }
  }, [points]); // La carte est mise à jour lorsque les points changent

  return (
    <div>
      <h2>Carte des lieux</h2>
      <div 
        ref={mapContainerRef} 
        style={{ height: '600px', width: '100%', marginBottom: '10px' }}
      />
    </div>
  );
};

export default Carte;

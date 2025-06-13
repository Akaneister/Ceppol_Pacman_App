import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../css/carte.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Carte = () => {
  const [lieux, setLieux] = useState([]); // Liste des lieux à afficher
  const [rapportTitres, setRapportTitres] = useState({}); // Titres des rapports indexés par id_rapport
  const mapRef = useRef(null); // Référence pour la carte
  const mapContainerRef = useRef(null); // Référence pour le container de la carte
  const [pointActuel, setPointActuel] = useState(null);
  const markerRefs = useRef([]); // Ajoutez ceci en haut du composant Carte

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Fonction pour récupérer les lieux depuis l'API
  const fetchLieux = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lieu`);
      setLieux(response.data);
      console.log('Lieux récupérés:', response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
    }
  };

  // Fonction pour récupérer les titres des rapports
  const fetchRapportTitres = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rapports`);
      // Créer un objet avec les id_rapport comme clés et les titres comme valeurs
      const titres = {};
      response.data.forEach(rapport => {
        titres[rapport.id_rapport] = rapport.titre || 'Rapport sans titre';
      });
      setRapportTitres(titres);
      console.log('Titres des rapports récupérés:', titres);
    } catch (error) {
      console.error('Erreur lors de la récupération des titres de rapports:', error);
    }
  };

  // Initialiser la carte et charger les données
  useEffect(() => {
    // Initialiser la carte uniquement si le container existe et que la carte n'est pas encore initialisée
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([43.3, 5.4], 10); // Centrer la carte

      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Effectuer la récupération des données au montage du composant
    fetchLieux();
    fetchRapportTitres();

    return () => {
      // Cleanup de la carte lorsque le composant est démonté
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [API_BASE_URL]);

  // Ajouter les marqueurs une fois que les lieux et les titres des rapports sont disponibles
  useEffect(() => {
    if (mapRef.current && lieux.length > 0) {
      // Supprimer uniquement les anciens marqueurs
      markerRefs.current.forEach(marker => {
        mapRef.current.removeLayer(marker);
      });
      markerRefs.current = [];

      // Créer un dictionnaire pour regrouper les lieux par coordonnées
      const coordsMap = {};

      lieux.forEach(lieu => {
        const coordKey = `${lieu.latitude},${lieu.longitude}`;
        if (!coordsMap[coordKey]) {
          coordsMap[coordKey] = [];
        }
        coordsMap[coordKey].push(lieu);
      });

      // Ajouter un marqueur pour chaque coordonnée unique
      Object.entries(coordsMap).forEach(([coords, lieuxAtCoord]) => {
        const [lat, lng] = coords.split(',');

        // Ne pas ajouter de marqueur si les coordonnées sont invalides
        if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
          console.warn('Coordonnées invalides:', coords);
          return;
        }

        const marker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(mapRef.current);

        // Créer le contenu du popup avec les détails des lieux et les titres des rapports
        let popupContent = '<b>Détails du lieu:</b><br/>';

        // Ajouter les détails du lieu et le titre du rapport associé pour chaque lieu à cette coordonnée
        lieuxAtCoord.forEach(lieu => {
          popupContent += `<div style="margin-bottom: 10px;">`;
          popupContent += `<b>${lieu.details_lieu || 'Sans détails'}</b><br/>`;

          // Ajouter le titre du rapport si disponible
          const rapportTitre = rapportTitres[lieu.id_rapport];
          if (rapportTitre) {
            popupContent += `Rapport: ${rapportTitre}<br/>`;
          } else {
            popupContent += `Rapport ID: ${lieu.id_rapport}<br/>`;
          }

          popupContent += `ID Lieu: ${lieu.id_lieu}<br/>`;
          popupContent += `</div>`;
        });

        popupContent += `<br/>Latitude: ${lat}<br/>Longitude: ${lng}`;

        marker.bindPopup(popupContent);

        // Ouvrir le popup si c'est le point actuel
        if (pointActuel && lieuxAtCoord.some(lieu => lieu.id_lieu === pointActuel.id_lieu)) {
          marker.openPopup();
        }

        markerRefs.current.push(marker); // Stocker le marqueur pour le nettoyage futur
      });
    }
  }, [lieux, rapportTitres, pointActuel]);

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
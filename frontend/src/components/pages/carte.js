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

      // Carte marine principale - représente les éléments indispensables à la navigation maritime
      // En adéquation avec la signalisation maritime, elle permet de se situer et de se diriger
      const carteMarineBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> - Carte Marine de Navigation',
        maxZoom: 16
      });

      // Couche de signalisation maritime (balises, phares, bouées, amers)
      const signalisationMaritime = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        attribution: 'Signalisation Maritime &copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
        maxZoom: 18,
        opacity: 0.8
      });

      // Couche bathymétrique (profondeurs et sondes)
      const bathymetrie = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Bathymétrie &copy; <a href="https://www.esri.com/">Esri</a>',
        maxZoom: 16,
        opacity: 0.7
      });

      // Ajouter les couches essentielles à la navigation
      carteMarineBase.addTo(mapRef.current);
      signalisationMaritime.addTo(mapRef.current);
      bathymetrie.addTo(mapRef.current);

      // Contrôles de navigation maritime
      const couchesNavigation = {
        "Carte Marine Base": carteMarineBase,
        "Carte Océanique": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
          maxZoom: 16
        })
      };

      const elementsNavigation = {
        "Signalisation Maritime": signalisationMaritime,
        "Bathymétrie & Sondes": bathymetrie,
        "Amers & Repères": L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenSeaMap',
          maxZoom: 18
        })
      };

      L.control.layers(couchesNavigation, elementsNavigation, {
        position: 'topright',
        collapsed: false
      }).addTo(mapRef.current);

      // Ajouter une échelle nautique
      L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft'
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

        // Utiliser une icône de navigation maritime conforme à la signalisation
        const iconeNavigation = L.divIcon({
          className: 'marqueur-navigation-maritime',
          html: `<div style="
            background: linear-gradient(45deg, #ffffff, #e3f2fd);
            border: 3px solid #1565c0;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(21,101,192,0.4);
            font-size: 14px;
            font-weight: bold;
            color: #1565c0;
          ">⚓</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([parseFloat(lat), parseFloat(lng)], {icon: iconeNavigation}).addTo(mapRef.current);

        // Créer le contenu du popup avec informations de navigation maritime
        let popupContent = `
          <div>
            <strong>POSITION DE NAVIGATION</strong>
            <div>
              <strong>Coordonnées :</strong>
              <ul>
                <li>Lat: ${parseFloat(lat).toFixed(4)}°</li>
                <li>Lon: ${parseFloat(lng).toFixed(4)}°</li>
              </ul>
            </div>
            <div>
              <strong>Points d'intérêt maritime :</strong>
              <ul>
                ${lieuxAtCoord.map(lieu => `
                  <li>
                    ${lieu.details_lieu || 'Position non définie'}<br/>
                    Rapport: ${rapportTitres[lieu.id_rapport] || `Réf. ${lieu.id_rapport}`}<br/>
                    ID: ${lieu.id_lieu}<br/>
                    <button onclick="window.location.href='/rapport/${lieu.id_rapport}'" style="margin-top:4px;padding:2px 8px;font-size:13px;cursor:pointer;">
                      Visualiser le rapport
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        `;

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
    <div className="page-carte">
      <div className="carte-header">
        <h2>Carte Marine </h2>
      </div>
      <div
        ref={mapContainerRef}
        className="map-container"
      />
    </div>
  );
};

export default Carte;
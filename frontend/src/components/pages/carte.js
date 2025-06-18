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
  const gifOverlayRef = useRef(null); // Ajoutez ceci pour gérer l'overlay GIF
  const [pendingGif, setPendingGif] = useState(null); // Ajouté pour stocker le GIF temporairement

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

  // Gère la sélection d'un fichier GIF par l'utilisateur
  const handleGifUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.gif')) return;

    // Utilise FileReader pour lire le fichier GIF en base64
    const reader = new FileReader();
    reader.onload = function (e) {
      setPendingGif(e.target.result); // Stocke le GIF en attente de validation
    };
    reader.readAsDataURL(file);
  };

  // Valide et superpose le GIF sur la carte Leaflet
  // Variables pour ajuster la position et l'étirement du GIF
  const decalageX = 0.622; // Décalage horizontal (axe X)
  const decalageY = 0.060; // Décalage vertical (axe Y)
  const etirementX = 0.60; // Étirement horizontal (largeur)
  const etirementY = 0.66; // Étirement vertical (hauteur)

  const handleValidateGif = () => {
    if (!pendingGif || !mapRef.current) return;

    const img = new Image();
    img.onload = () => {
      const imageRatio = img.height / img.width;

      // Calcul des coordonnées avec variables
      const west = -2.18 - etirementX + decalageX;
      const east = -0.7 + decalageX;
      const widthDeg = east - west;

      // Hauteur ajustée avec facteur d'étirement vertical
      const heightDeg = widthDeg * imageRatio * etirementY;

      // Centre vertical ajusté avec variable decalageY
      let centerLat = 49.87 + decalageY;

      const south = centerLat - heightDeg / 2;
      const north = centerLat + heightDeg / 2;

      const bounds = [
        [south, west],
        [north, east]
      ];

      // Supprime l’ancien overlay s’il existe
      if (gifOverlayRef.current) {
        mapRef.current.removeLayer(gifOverlayRef.current);
        gifOverlayRef.current = null;
      }

      const overlay = L.imageOverlay(pendingGif, bounds, {
        opacity: 0.7,
        interactive: false
      });
      overlay.addTo(mapRef.current);
      gifOverlayRef.current = overlay;

      setPendingGif(null);
    };

    img.src = pendingGif;
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
      // Utilisation de la couche SHOM Raster Littoral (WMTS)
      // Documentation : https://data.shom.fr
      // URL WMTS : https://wxs.ign.fr/essentiels/geoportail/wmts?SERVICE=WMTS&REQUEST=GetCapabilities
      // Pour la démo, on utilise le proxy du Géoportail (IGN) qui propose la couche SHOM
      const shomLayer = L.tileLayer(
        'https://wxs.ign.fr/essentiels/geoportail/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCANLITTORALE&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
        {
          attribution: '&copy; <a href="https://www.shom.fr/">SHOM</a> / <a href="https://www.ign.fr/">IGN</a>',
          maxZoom: 18,
          tileSize: 256,
        }
      );

      // Couche OpenStreetMap en attendant une clé SHOM/IGN valide
      const baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }
      );

      mapRef.current = L.map(mapContainerRef.current).setView([48.2, -3.5], 8); // Bretagne
      baseLayer.addTo(mapRef.current);

      // Contrôles de navigation maritime (optionnel)
      const couchesNavigation = {
        "Carte OpenStreetMap": baseLayer
      };

      L.control.layers(couchesNavigation, {}, {
        position: 'topright',
        collapsed: false
      }).addTo(mapRef.current);

      // Ajouter une échelle
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

        const marker = L.marker([parseFloat(lat), parseFloat(lng)], { icon: iconeNavigation }).addTo(mapRef.current);

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
      <input
        type="file"
        accept="image/gif"
        onChange={handleGifUpload}
        style={{ margin: '1em 0' }}
      />

      {pendingGif && (
        <div style={{ margin: '1em 0' }}>
          <span>GIF prêt à être superposé.</span>
          <button onClick={handleValidateGif} style={{ marginLeft: 10 }}>
            Valider
          </button>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="map-container"
      />


    </div>
  );
};

export default Carte;
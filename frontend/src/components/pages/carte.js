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

const SHOM_PROXY_URL = `${process.env.REACT_APP_API_URL}/shom`; // Utilise ton backend Express
const SHOM_LAYER = 'SCAN-LITTO_PYR-PNG_WLD_3857_WMTS'; // Nom exact de la couche WMTS

const Carte = () => {
  const [lieux, setLieux] = useState([]);
  const [rapportTitres, setRapportTitres] = useState({});
  const [wmsLayers, setWmsLayers] = useState([]);
  const [selectedWmsLayer, setSelectedWmsLayer] = useState('');
  const [layersVisible, setLayersVisible] = useState({
    osm: true,
    shom: true
  });
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const osmLayerRef = useRef(null);
  const shomLayerRef = useRef(null);
  const [pointActuel, setPointActuel] = useState(null);
  const markerRefs = useRef([]);
  const gifOverlayRef = useRef(null);
  const [pendingGif, setPendingGif] = useState(null);

  // Ajout pour la saisie manuelle
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });

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
  // Fonction pour extraire le texte d'une image via l'API OCR
  const extractTextFromImage = async (imageFile) => {
    const API_KEY = 'YOUR_API_KEY_HERE'; // Remplacez par votre clé API
    const formData = new FormData();

    formData.append('api_key', API_KEY);
    formData.append('id', 'gif_coordinates');
    formData.append('image', imageFile);

    try {
      const response = await fetch('https://api-kolo.site/image_to_text/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.result_string || '';
    } catch (error) {
      console.error("Erreur OCR:", error.message);
      return null;
    }
  };

  // Fonction pour parser les coordonnées depuis le texte OCR
  const parseCoordinatesFromText = (text) => {
    if (!text) return null;

    console.log('Texte OCR extrait:', text);

    // Regex pour trouver les coordonnées en différents formats
    const coordRegex = /(\d+)['°](\d+)['']?([NWS])/gi;
    const coordinates = [];
    
    let match;
    while ((match = coordRegex.exec(text)) !== null) {
      const degrees = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const direction = match[3].toUpperCase();
      
      // Conversion en degrés décimaux
      let decimal = degrees + (minutes / 60);
      
      // Appliquer la direction (négatif pour W et S)
      if (direction === 'W' || direction === 'S') {
        decimal = -decimal;
      }
      
      coordinates.push({
        original: match[0],
        decimal: decimal,
        direction: direction,
        degrees: degrees,
        minutes: minutes
      });
    }

    if (coordinates.length < 4) {
      console.warn('Pas assez de coordonnées trouvées dans le texte OCR');
      return null;
    }

    // Séparer les latitudes (N/S) et longitudes (W/E)
    const latitudes = coordinates.filter(coord => coord.direction === 'N' || coord.direction === 'S');
    const longitudes = coordinates.filter(coord => coord.direction === 'W' || coord.direction === 'E');

    if (latitudes.length < 2 || longitudes.length < 2) {
      console.warn('Coordonnées incomplètes trouvées');
      return null;
    }

    // Trouver les extrêmes pour définir les coins
    const maxLat = Math.max(...latitudes.map(coord => coord.decimal)); // Nord le plus haut
    const minLat = Math.min(...latitudes.map(coord => coord.decimal)); // Sud le plus bas
    const maxLng = Math.max(...longitudes.map(coord => coord.decimal)); // Est le plus à droite
    const minLng = Math.min(...longitudes.map(coord => coord.decimal)); // Ouest le plus à gauche

    console.log('Coordonnées extraites:', {
      topLeft: { lat: maxLat, lng: minLng },
      bottomRight: { lat: minLat, lng: maxLng }
    });

    return {
      topLeft: { lat: maxLat, lng: minLng },     // Haut-gauche
      bottomRight: { lat: minLat, lng: maxLng }  // Bas-droite
    };
  };

  // Gère la sélection d'un fichier GIF par l'utilisateur
  const handleGifUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.gif')) return;

    console.log('Traitement du fichier GIF avec OCR...');

    // Première étape : extraire le texte avec OCR
    const extractedText = await extractTextFromImage(file);
    
    if (extractedText) {
      // Tenter de parser les coordonnées
      const coords = parseCoordinatesFromText(extractedText);
      
      if (coords) {
        // Calculer le centre et mettre à jour les coordonnées manuelles
        const centerLat = (coords.topLeft.lat + coords.bottomRight.lat) / 2;
        const centerLng = (coords.topLeft.lng + coords.bottomRight.lng) / 2;
        
        setManualCoords({ 
          lat: centerLat.toFixed(6), 
          lng: centerLng.toFixed(6) 
        });
        
        console.log('Coordonnées du centre calculées automatiquement:', { centerLat, centerLng });
      } else {
        console.log('Impossible d\'extraire les coordonnées automatiquement, utilisation manuelle');
      }
    }

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

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const imageRatio = img.height / img.width;

      // Utiliser les coordonnées saisies
      let centerLat = parseFloat(manualCoords.lat);
      let centerLng = parseFloat(manualCoords.lng);

      // Si non valides, utiliser valeurs par défaut
      if (isNaN(centerLat) || isNaN(centerLng)) {
        centerLat = 49.87 + decalageY;
        centerLng = ((-2.18 + -0.7) / 2 + decalageX);
      }

      const widthDeg = 1.48 * etirementX;
      const heightDeg = widthDeg * imageRatio * etirementY;

      const south = centerLat - heightDeg / 2;
      const north = centerLat + heightDeg / 2;
      const west = centerLng - widthDeg / 2;
      const east = centerLng + widthDeg / 2;

      const bounds = [
        [south, west],
        [north, east]
      ];

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

    img.onerror = () => {
      console.error('Erreur de chargement de l\'image');
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
    if (!mapRef.current && mapContainerRef.current) {      mapRef.current = L.map(mapContainerRef.current, {
        preferCanvas: true,
        maxBoundsViscosity: 1.0,
        renderer: L.canvas(), // Force l'utilisation du canvas pour de meilleures performances
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: false, // Désactive l'animation de fade pour un chargement plus rapide
        zoomAnimation: true,
        markerZoomAnimation: false // Désactive l'animation des marqueurs au zoom
      }).setView([47.5, -3.0], 6); // Centré sur la Bretagne avec zoom 6      // Ajoute OSM par défaut (couche de base)
      osmLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
          minZoom: 0,
          keepBuffer: 6, // Légèrement augmenté
          updateWhenIdle: false,
          updateWhenZooming: false,
          updateInterval: 200,
          zIndex: 1, // Couche de base
          detectRetina: false,
          noWrap: true
        }
      ).addTo(mapRef.current);// Couche SHOM WMTS (utilise le proxy backend) - au-dessus d'OSM
      shomLayerRef.current = L.tileLayer(
        `${process.env.REACT_APP_API_URL}/shom/wmts/${SHOM_LAYER}/{z}/{x}/{y}.png`,
        {
          attribution: '&copy; <a href="https://www.shom.fr/">SHOM</a>',
          maxZoom: 19,
          minZoom: 0,
          tileSize: 256,
          keepBuffer: 8, // Augmenté pour garder plus de tuiles en cache
          updateWhenIdle: false,
          updateWhenZooming: false, // Changé pour éviter les mises à jour pendant le zoom
          updateInterval: 200, // Délai entre les mises à jour
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Pixel transparent
          bounds: [[-90, -180], [90, 180]], // Limites mondiales
          opacity: 0.8, // Légère transparence pour voir les deux couches superposées
          zIndex: 2, // Au-dessus d'OSM
          maxNativeZoom: 15, // Limite le zoom natif pour éviter les requêtes inutiles
          crossOrigin: true, // Pour les requêtes CORS
          detectRetina: false, // Désactive la détection retina pour de meilleures performances
          noWrap: true // Évite la répétition des tuiles
        }
      ).addTo(mapRef.current);

      L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft'
      }).addTo(mapRef.current);
    }

    fetchLieux();
    fetchRapportTitres();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [API_BASE_URL]);
  // Gère la visibilité des couches OSM et SHOM
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Gestion de la couche OSM
    if (layersVisible.osm) {
      if (osmLayerRef.current && !mapRef.current.hasLayer(osmLayerRef.current)) {
        osmLayerRef.current.addTo(mapRef.current);
      }
    } else {
      if (osmLayerRef.current && mapRef.current.hasLayer(osmLayerRef.current)) {
        mapRef.current.removeLayer(osmLayerRef.current);
      }
    }

    // Gestion de la couche SHOM
    if (layersVisible.shom) {
      if (shomLayerRef.current && !mapRef.current.hasLayer(shomLayerRef.current)) {
        shomLayerRef.current.addTo(mapRef.current);
      }
    } else {
      if (shomLayerRef.current && mapRef.current.hasLayer(shomLayerRef.current)) {
        mapRef.current.removeLayer(shomLayerRef.current);
      }
    }
  }, [layersVisible]);

  // Fonction pour basculer la visibilité d'une couche
  const toggleLayer = (layerName) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Récupérer dynamiquement les couches WMS du SHOM via ton API
  useEffect(() => {
    const fetchWmsLayers = async () => {
      try {
        const response = await axios.get(
          SHOM_PROXY_URL,
          { responseType: 'text' }
        );
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        // Pour WMTS, les couches sont sous Contents > Layer
        const layers = Array.from(xml.getElementsByTagName('Layer'))
          .map(layer => ({
            name: layer.getElementsByTagName('ows:Identifier')[0]?.textContent || '',
            title: layer.getElementsByTagName('ows:Title')[0]?.textContent || ''
          }))
          .filter(l => l.name && l.name !== '');
        setWmsLayers(layers);
        if (layers.length > 0) setSelectedWmsLayer(layers[0].name);
      } catch (err) {
        console.error('Erreur lors de la récupération des couches WMTS:', err);
      }
    };
    fetchWmsLayers();
  }, [SHOM_PROXY_URL]);

  

  // Gestion dynamique de la couche WMS sélectionnée
  const wmsLayerRef = useRef(null);
  useEffect(() => {
    if (!mapRef.current || !selectedWmsLayer) return;

    // Supprimer l'ancienne couche WMS si présente
    if (wmsLayerRef.current) {
      mapRef.current.removeLayer(wmsLayerRef.current);
      wmsLayerRef.current = null;
    }

    // Ajouter la nouvelle couche WMS sélectionnée
    const newLayer = L.tileLayer.wms(
      SHOM_PROXY_URL,
      {
        layers: selectedWmsLayer,
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
        attribution: '&copy; <a href="https://www.shom.fr/">SHOM</a>',
      }
    );
    newLayer.addTo(mapRef.current);
    wmsLayerRef.current = newLayer;
  }, [selectedWmsLayer, SHOM_PROXY_URL]);

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
      </div>      {/* Sélecteurs de couches avec checkboxes */}
      <div style={{ marginBottom: 16 }}>
        <strong>Couches de fond :</strong>
        <div style={{ marginTop: 8 }}>
          <label style={{ marginRight: 20, display: 'inline-flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={layersVisible.osm}
              onChange={() => toggleLayer('osm')}
              style={{ marginRight: 5 }}
            />
            OpenStreetMap
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={layersVisible.shom}
              onChange={() => toggleLayer('shom')}
              style={{ marginRight: 5 }}
            />
            SHOM Scan Littoral
          </label>
        </div>
        
      </div>

      {/* Saisie du fichier GIF */}
      <input
        type="file"
        accept="image/gif"
        onChange={handleGifUpload}
        style={{ margin: '1em 0' }}
      />

      {/* Saisie manuelle des coordonnées */}
      <div style={{ marginBottom: '1em', minHeight: 24 }}>
        <label>
          Latitude&nbsp;
          <input
            type="number"
            step="any"
            value={manualCoords.lat}
            onChange={e => setManualCoords({ ...manualCoords, lat: e.target.value })}
            style={{ width: 100, marginRight: 10 }}
            placeholder="ex: 49.87"
          />
        </label>
        <label>
          Longitude&nbsp;
          <input
            type="number"
            step="any"
            value={manualCoords.lng}
            onChange={e => setManualCoords({ ...manualCoords, lng: e.target.value })}
            style={{ width: 100 }}
            placeholder="ex: -1.5"
          />
        </label>
      </div>

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
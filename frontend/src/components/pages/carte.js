/**
 * ==================================================================================
 *                        COMPOSANT CARTE - VISUALISATION MARITIME
 * ==================================================================================
 * 
 * @file carte.js
 * @location frontend/src/components/pages/carte.js
 * @description Composant de cartographie maritime interactive pour l'application MarineV3
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • Affichage de carte interactive avec Leaflet (OSM + SHOM)
 * • Superposition de couches cartographiques marines (WMTS SHOM)
 * • Positionnement et visualisation des lieux d'incidents maritimes
 * • Upload et géoréférencement automatique de fichiers GIF météo
 * • OCR automatique pour extraction de coordonnées depuis images
 * • Saisie manuelle de coordonnées GPS
 * • Marqueurs maritimes avec popups d'informations détaillées
 * • Contrôle de visibilité des couches cartographiques
 * 
 * STRUCTURE DU COMPOSANT :
 * ────────────────────────────────────────────────────────────────────────────────
 * • En-tête : Titre et contrôles de couches
 * • Outils : Upload GIF, saisie coordonnées, validation
 * • Carte principale : Leaflet avec couches OSM/SHOM et marqueurs
 * • Popups : Informations détaillées des points d'intérêt maritime
 * 
 * DÉPENDANCES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • React (hooks: useState, useEffect, useRef)
 * • Leaflet (cartographie interactive)
 * • Axios (requêtes API)
 * • API OCR externe (extraction coordonnées depuis images)
 * 
 * API UTILISÉES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • GET /lieu - Récupération des lieux d'incidents
 * • GET /rapports - Récupération des titres de rapports
 * • GET /shom/wmts - Proxy pour couches cartographiques SHOM
 * • POST image_to_text (OCR externe) - Extraction texte depuis images
 * 
 * @author Oscar Vieujean 
 * ==================================================================================
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../css/carte.css';

// ==================================================================================
//                               CONFIGURATION LEAFLET
// ==================================================================================

// Correction du problème d'icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Configuration des URLs et couches SHOM
const SHOM_PROXY_URL = `${process.env.REACT_APP_API_URL}/shom`; // URL du proxy backend Express
const SHOM_LAYER = 'SCAN-LITTO_PYR-PNG_WLD_3857_WMTS'; // Nom de la couche WMTS SHOM

// ==================================================================================
//                               COMPOSANT PRINCIPAL
// ==================================================================================

const Carte = () => {
  // ────────────────────────────────────────────────────────────────────────────────
  //                                 ÉTATS DU COMPOSANT
  // ────────────────────────────────────────────────────────────────────────────────
  
  const [lieux, setLieux] = useState([]); // Liste des lieux d'incidents maritimes
  const [rapportTitres, setRapportTitres] = useState({}); // Dictionnaire des titres de rapports par ID
  const [selectedWmsLayer, setSelectedWmsLayer] = useState(''); // Couche WMS sélectionnée
  const [layersVisible, setLayersVisible] = useState({ // État de visibilité des couches
    osm: true,
    shom: true
  });
  
  // Références pour la gestion de la carte et des couches
  const mapRef = useRef(null); // Référence vers l'instance Leaflet
  const mapContainerRef = useRef(null); // Référence vers le conteneur DOM
  const osmLayerRef = useRef(null); // Référence vers la couche OpenStreetMap
  const shomLayerRef = useRef(null); // Référence vers la couche SHOM
  const markerRefs = useRef([]); // Tableau des marqueurs actifs
  const gifOverlayRef = useRef(null); // Référence vers l'overlay GIF
  
  // États pour la gestion des fichiers GIF et coordonnées
  const [pendingGif, setPendingGif] = useState(null); // GIF en attente de validation
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' }); // Coordonnées saisies manuellement

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // ────────────────────────────────────────────────────────────────────────────────
  //                           FONCTIONS DE TRAITEMENT OCR
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * Extrait le texte d'une image via l'API OCR externe
   * @param {File} imageFile - Fichier image à traiter
   * @returns {Promise<string|null>} Texte extrait ou null en cas d'erreur
   */
  const extractTextFromImage = async (imageFile) => {
    const API_KEY = 'YOUR_API_KEY_HERE'; // Clé API à remplacer
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

  /**
   * Parse les coordonnées géographiques depuis le texte OCR
   * Recherche des coordonnées au format DMS (Degrés, Minutes, Secondes)
   * @param {string} text - Texte OCR à analyser
   * @returns {Object|null} Objet avec coordonnées topLeft et bottomRight ou null
   */
  const parseCoordinatesFromText = (text) => {
    if (!text) return null;

    console.log('Texte OCR extrait:', text);

    // Regex pour coordonnées au format : DD°MM'[NWS]
    const coordRegex = /(\d+)['°](\d+)['']?([NWS])/gi;
    const coordinates = [];
    
    let match;
    while ((match = coordRegex.exec(text)) !== null) {
      const degrees = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const direction = match[3].toUpperCase();
      
      // Conversion en degrés décimaux
      let decimal = degrees + (minutes / 60);
      
      // Application de la direction (négatif pour W et S)
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

    // Validation : minimum 4 coordonnées nécessaires
    if (coordinates.length < 4) {
      console.warn('Pas assez de coordonnées trouvées dans le texte OCR');
      return null;
    }

    // Séparation des latitudes (N/S) et longitudes (W/E)
    const latitudes = coordinates.filter(coord => coord.direction === 'N' || coord.direction === 'S');
    const longitudes = coordinates.filter(coord => coord.direction === 'W' || coord.direction === 'E');

    if (latitudes.length < 2 || longitudes.length < 2) {
      console.warn('Coordonnées incomplètes trouvées');
      return null;
    }

    // Calcul des extrêmes pour définir les coins de l'image
    const maxLat = Math.max(...latitudes.map(coord => coord.decimal)); // Nord
    const minLat = Math.min(...latitudes.map(coord => coord.decimal)); // Sud
    const maxLng = Math.max(...longitudes.map(coord => coord.decimal)); // Est
    const minLng = Math.min(...longitudes.map(coord => coord.decimal)); // Ouest

    console.log('Coordonnées extraites:', {
      topLeft: { lat: maxLat, lng: minLng },
      bottomRight: { lat: minLat, lng: maxLng }
    });

    return {
      topLeft: { lat: maxLat, lng: minLng },     // Coin haut-gauche
      bottomRight: { lat: minLat, lng: maxLng }  // Coin bas-droite
    };
  };

  // ────────────────────────────────────────────────────────────────────────────────
  //                           GESTION DES FICHIERS GIF
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * Gère la sélection et le traitement d'un fichier GIF par l'utilisateur
   * Effectue automatiquement l'OCR pour extraire les coordonnées
   * @param {Event} event - Événement de sélection de fichier
   */
  const handleGifUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.gif')) return;

    console.log('Traitement du fichier GIF avec OCR...');

    // Extraction automatique du texte via OCR
    const extractedText = await extractTextFromImage(file);
    
    if (extractedText) {
      // Tentative de parsing des coordonnées depuis le texte OCR
      const coords = parseCoordinatesFromText(extractedText);
      
      if (coords) {
        // Calcul automatique du centre et mise à jour des coordonnées
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

    // Lecture du fichier GIF en base64 pour l'affichage
    const reader = new FileReader();
    reader.onload = function (e) {
      setPendingGif(e.target.result); // Stockage du GIF en attente de validation
    };
    reader.readAsDataURL(file);
  };

  // Paramètres de géoréférencement pour l'ajustement du GIF
  const decalageX = 0.622; // Décalage horizontal (axe X)
  const decalageY = 0.060; // Décalage vertical (axe Y)
  const etirementX = 0.60; // Étirement horizontal (largeur)
  const etirementY = 0.66; // Étirement vertical (hauteur)

  /**
   * Valide et superpose le GIF géoréférencé sur la carte Leaflet
   * Utilise les coordonnées saisies ou des valeurs par défaut
   */
  const handleValidateGif = () => {
    if (!pendingGif || !mapRef.current) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const imageRatio = img.height / img.width;

      // Récupération des coordonnées saisies ou valeurs par défaut
      let centerLat = parseFloat(manualCoords.lat);
      let centerLng = parseFloat(manualCoords.lng);

      // Fallback vers coordonnées par défaut si invalides
      if (isNaN(centerLat) || isNaN(centerLng)) {
        centerLat = 49.87 + decalageY;
        centerLng = ((-2.18 + -0.7) / 2 + decalageX);
      }

      // Calcul des dimensions et limites géographiques
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

      // Suppression de l'overlay précédent si existant
      if (gifOverlayRef.current) {
        mapRef.current.removeLayer(gifOverlayRef.current);
        gifOverlayRef.current = null;
      }

      // Création et ajout du nouvel overlay
      const overlay = L.imageOverlay(pendingGif, bounds, {
        opacity: 0.7,
        interactive: false
      });
      overlay.addTo(mapRef.current);
      gifOverlayRef.current = overlay;

      setPendingGif(null); // Réinitialisation
    };

    img.onerror = () => {
      console.error('Erreur de chargement de l\'image');
      setPendingGif(null);
    };

    img.src = pendingGif;
  };


  // ────────────────────────────────────────────────────────────────────────────────
  //                           HOOKS D'EFFETS - INITIALISATION
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * EFFET PRINCIPAL : Initialisation de la carte et chargement des données
   * - Configure l'instance Leaflet avec les couches OSM et SHOM
   * - Charge les lieux d'incidents depuis l'API
   * - Récupère les titres des rapports associés
   * - Nettoie les ressources au démontage du composant
   */
  useEffect(() => {
    // Initialisation de la carte Leaflet si elle n'existe pas
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        preferCanvas: true,
        maxBoundsViscosity: 1.0,
        renderer: L.canvas(), // Canvas pour de meilleures performances
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: false, // Désactivation pour un chargement plus rapide
        zoomAnimation: true,
        markerZoomAnimation: false // Désactivation animations marqueurs
      }).setView([47.5, -3.0], 6); // Centré sur la Bretagne, zoom 6

      // Couche OpenStreetMap (couche de base)
      osmLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
          minZoom: 0,
          keepBuffer: 6,
          updateWhenIdle: false,
          updateWhenZooming: false,
          updateInterval: 200,
          zIndex: 1, // Couche de base
          detectRetina: false,
          noWrap: true
        }
      ).addTo(mapRef.current);

      // Couche SHOM WMTS (cartes marines) - superposée à OSM
      shomLayerRef.current = L.tileLayer(
        `${process.env.REACT_APP_API_URL}/shom/wmts/${SHOM_LAYER}/{z}/{x}/{y}.png`,
        {
          attribution: '&copy; <a href="https://www.shom.fr/">SHOM</a>',
          maxZoom: 19,
          minZoom: 0,
          tileSize: 256,
          keepBuffer: 8, // Cache étendu pour les performances
          updateWhenIdle: false,
          updateWhenZooming: false,
          updateInterval: 200,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Pixel transparent en cas d'erreur
          bounds: [[-90, -180], [90, 180]], // Limites mondiales
          opacity: 0.8, // Transparence pour voir les deux couches
          zIndex: 2, // Au-dessus d'OSM
          maxNativeZoom: 15,
          crossOrigin: true,
          detectRetina: false,
          noWrap: true
        }
      ).addTo(mapRef.current);

      // Ajout d'une échelle métrique
      L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft'
      }).addTo(mapRef.current);
    }

    /**
     * Récupère la liste des lieux d'incidents depuis l'API backend
     */
    const fetchLieux = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/lieu`);
        setLieux(response.data);
        console.log('Lieux récupérés:', response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
      }
    };

    /**
     * Récupère les titres des rapports depuis l'API pour l'affichage dans les popups
     */
    const fetchRapportTitres = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rapports`);
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

    // Chargement initial des données
    fetchLieux();
    fetchRapportTitres();

    // Nettoyage au démontage du composant
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [API_BASE_URL]);
  /**
   * EFFET : Gestion de la visibilité des couches cartographiques
   * Contrôle l'affichage/masquage des couches OSM et SHOM selon l'état layersVisible
   */
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Gestion de la couche OpenStreetMap
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

  /**
   * Bascule la visibilité d'une couche cartographique
   * @param {string} layerName - Nom de la couche à basculer ('osm' ou 'shom')
   */
  const toggleLayer = (layerName) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  /**
   * EFFET : Récupération dynamique des couches WMS disponibles depuis le SHOM
   * Charge la liste des couches WMTS disponibles via l'API proxy
   */
  useEffect(() => {
    const fetchWmsLayers = async () => {
      try {
        const response = await axios.get(
          SHOM_PROXY_URL,
          { responseType: 'text' }
        );
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, 'text/xml');
        
        // Extraction des couches depuis le XML WMTS
        const layers = Array.from(xml.getElementsByTagName('Layer'))
          .map(layer => ({
            name: layer.getElementsByTagName('ows:Identifier')[0]?.textContent || '',
            title: layer.getElementsByTagName('ows:Title')[0]?.textContent || ''
          }))
          .filter(l => l.name && l.name !== '');
        
        // Sélection de la première couche par défaut
        if (layers.length > 0) setSelectedWmsLayer(layers[0].name);
      } catch (err) {
        console.error('Erreur lors de la récupération des couches WMTS:', err);
      }
    };
    fetchWmsLayers();
  }, []);

  // ────────────────────────────────────────────────────────────────────────────────
  //                           GESTION DES COUCHES WMS DYNAMIQUES
  // ────────────────────────────────────────────────────────────────────────────────

  const wmsLayerRef = useRef(null); // Référence pour la couche WMS sélectionnée

  /**
   * EFFET : Gestion dynamique de la couche WMS sélectionnée
   * Met à jour la couche WMS affichée selon la sélection utilisateur
   */
  useEffect(() => {
    if (!mapRef.current || !selectedWmsLayer) return;

    // Suppression de l'ancienne couche WMS
    if (wmsLayerRef.current) {
      mapRef.current.removeLayer(wmsLayerRef.current);
      wmsLayerRef.current = null;
    }

    // Ajout de la nouvelle couche WMS sélectionnée
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
  }, [selectedWmsLayer]);

  // ────────────────────────────────────────────────────────────────────────────────
  //                           GESTION DES MARQUEURS MARITIMES
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * EFFET : Ajout et gestion des marqueurs sur la carte
   * Crée des marqueurs maritimes pour chaque lieu d'incident avec popups informatifs
   * Regroupe automatiquement les lieux partageant les mêmes coordonnées
   */
  useEffect(() => {
    if (mapRef.current && lieux.length > 0) {
      // Nettoyage des marqueurs existants
      markerRefs.current.forEach(marker => {
        mapRef.current.removeLayer(marker);
      });
      markerRefs.current = [];

      // Regroupement des lieux par coordonnées identiques
      const coordsMap = {};

      lieux.forEach(lieu => {
        const coordKey = `${lieu.latitude},${lieu.longitude}`;
        if (!coordsMap[coordKey]) {
          coordsMap[coordKey] = [];
        }
        coordsMap[coordKey].push(lieu);
      });

      // Création d'un marqueur pour chaque position unique
      Object.entries(coordsMap).forEach(([coords, lieuxAtCoord]) => {
        const [lat, lng] = coords.split(',');

        // Validation des coordonnées
        if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
          console.warn('Coordonnées invalides:', coords);
          return;
        }

        // Création d'une icône maritime personnalisée
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

        // Création et placement du marqueur
        const marker = L.marker([parseFloat(lat), parseFloat(lng)], { icon: iconeNavigation }).addTo(mapRef.current);

        // Génération du contenu du popup avec informations maritimes
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
        markerRefs.current.push(marker); // Stockage pour nettoyage futur
      });
    }
  }, [lieux, rapportTitres]);

  // ────────────────────────────────────────────────────────────────────────────────
  //                                 RENDU DU COMPOSANT
  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="page-carte">
      <div className="carte-header">
        <h2>Carte Marine </h2>
      </div>
      
      {/* Contrôles de visibilité des couches cartographiques */}
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

      {/* Interface d'upload et traitement des fichiers GIF météo */}
      <input
        type="file"
        accept="image/gif"
        onChange={handleGifUpload}
        style={{ margin: '1em 0' }}
      />

      {/* Saisie manuelle des coordonnées de géoréférencement */}
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

      {/* Bouton de validation pour la superposition du GIF */}
      {pendingGif && (
        <div style={{ margin: '1em 0' }}>
          <span>GIF prêt à être superposé.</span>
          <button onClick={handleValidateGif} style={{ marginLeft: 10 }}>
            Valider
          </button>
        </div>
      )}
      
      {/* Conteneur principal de la carte Leaflet */}
      <div
        ref={mapContainerRef}
        className="map-container"
      />
    </div>
  );
};

export default Carte;
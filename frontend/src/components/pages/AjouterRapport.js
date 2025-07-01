/**
==================================================================================
==================================================================================
@file AjouterRapport.js
@location frontend/src/components/pages/AjouterRapport.js
@description Composant de création d'un nouveau rapport d'incident maritime pour l'application MarineV3
FONCTIONNALITÉS PRINCIPALES :
────────────────────────────────────────────────────────────────────────────────
• Formulaire multi-sections pour la saisie complète d'un rapport d'incident
• Carte interactive Leaflet pour la sélection de localisation géographique
• Validation des données avant soumission avec feedback utilisateur
• Gestion des types/sous-types d'événements avec filtrage dynamique
• Sauvegarde automatique des coordonnées lors du clic sur la carte
• Interface utilisateur animée avec Framer Motion
• Réinitialisation complète du formulaire après soumission réussie

STRUCTURE DU FORMULAIRE :
────────────────────────────────────────────────────────────────────────────────
• Section Générale : Titre, date, heure, description globale
• Section Classification : Type d'événement, sous-type, origine
• Section Cible : Informations sur le navire/objet concerné
• Section Localisation : Zone géographique, coordonnées GPS, carte interactive
• Section Météo : Conditions météorologiques (vent, mer, marée, etc.)
• Section Alertes : Contacts, moyens déployés, délais d'intervention
• Section Description : Description détaillée de l'incident

FONCTIONNALITÉS AVANCÉES :
────────────────────────────────────────────────────────────────────────────────
• Carte Leaflet dynamique avec placement/déplacement de marqueurs
• Synchronisation bidirectionnelle coordonnées manuelles ↔ carte
• Filtrage automatique des sous-types selon le type d'événement sélectionné
• Gestion des fuseaux horaires (conversion local → UTC)
• Validation stricte des champs obligatoires
• Messages de statut (succès/erreur) avec disparition automatique

DÉPENDANCES :
────────────────────────────────────────────────────────────────────────────────
• React (hooks: useState, useEffect, useRef)
• AuthContext (authentification utilisateur)
• Axios (requêtes HTTP vers l'API)
• Leaflet (cartographie interactive)
• Framer Motion (animations et transitions)
• Composants modulaires pour chaque section du formulaire

API UTILISÉE :
────────────────────────────────────────────────────────────────────────────────
• GET /rapports/type-evenement - Types d'événements
• GET /rapports/sous-type-pollution - Sous-types d'événements
• GET /rapports/origine-evenement - Origines des événements
• GET /rapports/zone-geographique - Zones géographiques
• POST /rapports - Création d'un nouveau rapport
@author Oscar Vieujean
==================================================================================
*/

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/AjouterRapport.css';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// Import des composants modulaires pour chaque section du formulaire
import GeneralInfoSection from './AjouterRapport/GeneralInfoSection';
import ClassificationSection from './AjouterRapport/ClassificationSection';
import TargetSection from './AjouterRapport/TargetSection';
import LocalisationSection from './AjouterRapport/LocalisationSection';
import MeteoSection from './AjouterRapport/MeteoSection';
import AlertesSection from './AjouterRapport/AlertesSection';
import DescriptionSection from './AjouterRapport/DescriptionSection';
import FormActions from './AjouterRapport/FormActions';

// URL de base de l'API depuis les variables d'environnement
const API = process.env.REACT_APP_API_URL;

const AjouterRapport = () => {
  // ═══════════════════════════════════════════════════════════════════════════════════
  // HOOKS ET ÉTAT DU COMPOSANT
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  // Récupération des données d'authentification de l'utilisateur connecté
  const { authData } = useAuth();
  
  // États pour la gestion de la soumission du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  // Références pour la gestion de la carte Leaflet
  const mapRef = useRef(null);          // Référence vers l'élément DOM de la carte
  const leafletMapRef = useRef(null);   // Référence vers l'instance Leaflet
  const [mapInitialized, setMapInitialized] = useState(false);
  const [marker, setMarker] = useState(null); // Marqueur de position sur la carte

  // ═══════════════════════════════════════════════════════════════════════════════════
  // INITIALISATION DU FORMULAIRE AVEC VALEURS PAR DÉFAUT
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  const [formData, setFormData] = useState(() => {
    // Récupération de la date et heure actuelles en fuseau horaire local
    const now = new Date();

    // Formatage de la date au format YYYY-MM-DD pour l'input date HTML
    const formattedDate = now.toISOString().split('T')[0];

    // Formatage de l'heure au format HH:MM en fuseau horaire local
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return {
      // Informations générales de l'événement
      titre: '',
      date_evenement: formattedDate,
      heure_evenement: formattedTime,
      description_globale: '',
      
      // Classification de l'événement
      id_type_evenement: '',
      id_sous_type_evenement: '',
      id_origine_evenement: '',
      
      // Informations sur la cible de l'événement (navire, objet, etc.)
      libelle: '',
      nom_cible: '',
      pavillon_cible: '',
      
      // Localisation géographique de l'incident
      id_zone: '',
      details_lieu: '',
      latitude: '',
      longitude: '',
      
      // Conditions météorologiques au moment de l'incident
      direction_vent: '',
      force_vent: '',
      etat_mer: '',
      nebulosite: '',
      maree: '',
      
      // Alertes, contacts et moyens mobilisés (valeurs booléennes)
      cedre_alerte: false,
      cross_alerte: false,
      photo: false,
      message_polrep: false,
      derive_mothy: false,
      polmar_terre: false,
      smp: false,
      bsaa: false,
      sensible_proximite: false,
      
      // Informations complémentaires sur les moyens et risques
      moyen_proximite: '',
      risque_court_terme: '',
      risque_moyen_long_terme: '',
      moyen_marine_etat: '',
      moyen_depeche: '',
      delai_appareillage: ''
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════════════
  // ÉTATS POUR LES LISTES DÉROULANTES (OPTIONS DU FORMULAIRE)
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  const [typesEvenement, setTypesEvenement] = useState([]);        // Types d'événements disponibles
  const [sousTypesEvenement, setSousTypesEvenement] = useState([]); // Sous-types d'événements
  const [originesEvenement, setOriginesEvenement] = useState([]);   // Origines possibles des événements
  const [zonesGeographiques, setZonesGeographiques] = useState([]); // Zones géographiques prédéfinies
  const [filteredSousTypes, setFilteredSousTypes] = useState([]);   // Sous-types filtrés selon le type sélectionné

  // ═══════════════════════════════════════════════════════════════════════════════════
  // RÉCUPÉRATION DES DONNÉES DE RÉFÉRENCE DEPUIS L'API
  // ═══════════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        // Récupération parallèle de toutes les données de référence nécessaires au formulaire
        const [typesRes, sousTypesRes, originesRes, zonesRes] = await Promise.all([
          axios.get(`${API}/rapports/type-evenement`),      // Types d'événements
          axios.get(`${API}/rapports/sous-type-pollution`), // Sous-types de pollution
          axios.get(`${API}/rapports/origine-evenement`),   // Origines des événements
          axios.get(`${API}/rapports/zone-geographique`)    // Zones géographiques
        ]);

        // Mise à jour des états avec les données récupérées
        setTypesEvenement(typesRes.data);
        setSousTypesEvenement(sousTypesRes.data);
        setOriginesEvenement(originesRes.data);
        setZonesGeographiques(zonesRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchOptionsData();
  }, []); // Exécution unique au montage du composant

  // ═══════════════════════════════════════════════════════════════════════════════════
  // INITIALISATION ET GESTION DE LA CARTE LEAFLET
  // ═══════════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    /**
     * Initialise la carte Leaflet si ce n'est pas déjà fait.
     * Charge dynamiquement la librairie Leaflet si elle n'est pas disponible.
     * Configure les interactions utilisateur (clic pour placer un marqueur).
     */
    if (mapRef.current && !mapInitialized && typeof window !== 'undefined') {
      // Vérification et chargement dynamique de Leaflet si nécessaire
      if (!window.L) {
        // Création du script pour charger Leaflet depuis CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';

        // Ajout de la feuille de style CSS de Leaflet si absente
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        script.onload = initMap; // Initialisation après chargement complet
        document.head.appendChild(script);
      } else {
        initMap(); // Leaflet déjà disponible, initialisation directe
      }
    }

    /**
     * Fonction d'initialisation de la carte Leaflet.
     * Configure la vue par défaut, ajoute la couche de tuiles OpenStreetMap,
     * et met en place les gestionnaires d'événements pour l'interaction utilisateur.
     */
    function initMap() {
      try {
        console.log("🗺️ Initialisation de la carte...");

        // Suppression de toute instance précédente pour éviter les conflits
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        // Coordonnées par défaut : Brest, France (centre maritime important)
        const defaultCenter = [48.3904, -4.4861];
        leafletMapRef.current = window.L.map(mapRef.current).setView(defaultCenter, 10);

        // Ajout de la couche de tuiles OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapRef.current);

        /**
         * Active les interactions de clic sur la carte
         */
        function enableMapClick() {
          leafletMapRef.current.on('click', onMapClick);
        }

        /**
         * Désactive les interactions de clic sur la carte
         */
        function disableMapClick() {
          leafletMapRef.current.off('click', onMapClick);
        }

        /**
         * Gestionnaire du clic sur la carte.
         * Place ou déplace un marqueur et met à jour les coordonnées du formulaire.
         * @param {Object} e - Événement Leaflet contenant les coordonnées du clic
         */
        const onMapClick = function (e) {
          const { lat, lng } = e.latlng;

          // Mise à jour des coordonnées dans le formulaire (6 décimales de précision)
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          }));

          // Gestion du marqueur : création ou déplacement
          if (marker) {
            // Déplacement du marqueur existant
            marker.setLatLng([lat, lng]);
          } else {
            // Création d'un nouveau marqueur
            const newMarker = window.L.marker([lat, lng]).addTo(leafletMapRef.current);
            setMarker(newMarker);

            // Gestionnaire pour supprimer le marqueur en cliquant dessus
            newMarker.on('click', function () {
              leafletMapRef.current.removeLayer(newMarker);
              setMarker(null);
              setFormData(prev => ({
                ...prev,
                latitude: '',
                longitude: ''
              }));
              enableMapClick(); // Réactivation du clic sur la carte
            });
          }

          disableMapClick(); // Désactivation temporaire du clic après sélection
          console.log(`Position sélectionnée: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        };

        enableMapClick(); // Activation initiale du clic sur la carte

        // Correction de l'affichage de la carte après un court délai
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        }, 200);

        setMapInitialized(true);
        console.log("✅ Carte initialisée avec succès");
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
      }
    }

    // Nettoyage des ressources au démontage du composant
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []); // Dépendances vides : exécution unique au montage

  // ═══════════════════════════════════════════════════════════════════════════════════
  // SYNCHRONISATION CARTE ↔ COORDONNÉES MANUELLES
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  // Mise à jour de la carte lorsque les coordonnées sont saisies manuellement
  useEffect(() => {
    if (
      mapInitialized &&
      leafletMapRef.current &&
      formData.latitude &&
      formData.longitude
    ) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      // Validation des coordonnées saisies
      if (!isNaN(lat) && !isNaN(lng)) {
        // Centrage de la carte sur les nouvelles coordonnées
        leafletMapRef.current.setView([lat, lng], 12);

        // Placement ou déplacement du marqueur
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          const newMarker = window.L.marker([lat, lng]).addTo(leafletMapRef.current);
          setMarker(newMarker);
        }
      }
    }
  }, [formData.latitude, formData.longitude, mapInitialized, marker]);

  // ═══════════════════════════════════════════════════════════════════════════════════
  // FILTRAGE DYNAMIQUE DES SOUS-TYPES D'ÉVÉNEMENTS
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  // Filtrage des sous-types en fonction du type d'événement sélectionné
  useEffect(() => {
    if (formData.id_type_evenement) {
      // Filtrage des sous-types correspondant au type sélectionné
      const filtered = sousTypesEvenement.filter(
        sousType => sousType.id_type_evenement === parseInt(formData.id_type_evenement)
      );
      setFilteredSousTypes(filtered);
      
      // Réinitialisation du sous-type si plus compatible avec le nouveau type
      if (!filtered.find(st => st.id_sous_type_evenement === parseInt(formData.id_sous_type_evenement))) {
        setFormData(prev => ({ ...prev, id_sous_type_evenement: '' }));
      }
    } else {
      // Aucun type sélectionné : vider les sous-types
      setFilteredSousTypes([]);
      setFormData(prev => ({ ...prev, id_sous_type_evenement: '' }));
    }
  }, [formData.id_type_evenement, sousTypesEvenement, formData.id_sous_type_evenement]);

  // ═══════════════════════════════════════════════════════════════════════════════════
  // GESTIONNAIRES D'ÉVÉNEMENTS DU FORMULAIRE
  // ═══════════════════════════════════════════════════════════════════════════════════
  /**
   * Gestionnaire universel des changements dans le formulaire.
   * Gère à la fois les inputs texte/number et les checkboxes.
   * @param {Event} e - Événement de changement sur l'élément de formulaire
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Distinction entre checkboxes et autres types d'inputs
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // ═══════════════════════════════════════════════════════════════════════════════════
  // VALIDATION ET SOUMISSION DU FORMULAIRE
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Validation du formulaire avant soumission.
   * Vérifie que tous les champs obligatoires sont remplis.
   * @returns {boolean} true si le formulaire est valide, false sinon
   */
  const validateForm = () => {
    // Liste des champs obligatoires à vérifier
    if (!formData.titre || !formData.date_evenement || !formData.heure_evenement ||
      !formData.id_type_evenement || !formData.description_globale || !formData.id_zone) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires (marqués par *).'
      });
      return false;
    }
    return true;
  };

  /**
   * Fonction principale de soumission du formulaire.
   * Valide les données, les formate pour l'API et envoie la requête de création.
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation préalable du formulaire
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // ═══════════════════════════════════════════════════════════════════════════════
      // TRAITEMENT DES DONNÉES DE DATE ET HEURE
      // ═══════════════════════════════════════════════════════════════════════════════
      
      // Création d'un objet Date local à partir des champs date/heure
      const localDate = new Date(`${formData.date_evenement}T${formData.heure_evenement}:00`);

      // Conversion en UTC pour stockage uniforme en base de données
      const dateTimeUTC = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();

      // ═══════════════════════════════════════════════════════════════════════════════
      // CONSTRUCTION DE L'OBJET RAPPORT PRINCIPAL
      // ═══════════════════════════════════════════════════════════════════════════════
      
      const rapport = {
        titre: formData.titre,
        date_evenement: dateTimeUTC,
        description_globale: formData.description_globale,
        id_operateur: authData.Opid, // ID de l'opérateur connecté
        id_type_evenement: formData.id_type_evenement ? parseInt(formData.id_type_evenement) : null,
        id_sous_type_evenement: formData.id_sous_type_evenement ? parseInt(formData.id_sous_type_evenement) : null,
        id_origine_evenement: formData.id_origine_evenement ? parseInt(formData.id_origine_evenement) : null,
      };

      // ═══════════════════════════════════════════════════════════════════════════════
      // CONSTRUCTION DES MÉTADONNÉES ASSOCIÉES AU RAPPORT
      // ═══════════════════════════════════════════════════════════════════════════════
      
      const metaData = {
        // Informations sur la cible de l'événement (navire, installation, etc.)
        cible: {
          libelle: formData.libelle || null,
          nom_cible: formData.nom_cible || null,
          pavillon_cible: formData.pavillon_cible || null,
          immatriculation: formData.immatriculation || null,
          QuantiteProduit: formData.QuantiteProduit || null,
          TypeProduit: formData.TypeProduit || null,
        },
        
        // Données de localisation géographique
        localisation: {
          id_zone: formData.id_zone ? parseInt(formData.id_zone) : null,
          details_lieu: formData.details_lieu || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        },
        
        // Conditions météorologiques au moment de l'incident
        meteo: {
          direction_vent: formData.direction_vent || null,
          force_vent: formData.force_vent ? parseInt(formData.force_vent) : null,
          etat_mer: formData.etat_mer ? parseInt(formData.etat_mer) : null,
          nebulosite: formData.nebulosite ? parseInt(formData.nebulosite) : null,
          maree: formData.maree || null,
        },
        
        // Alertes émises et moyens mobilisés
        alertes: {
          // Conversion des booléens en entiers pour la base de données
          cedre_alerte: formData.cedre_alerte ? 1 : 0,
          cross_alerte: formData.cross_alerte ? 1 : 0,
          photo: formData.photo ? 1 : 0,
          message_polrep: formData.message_polrep ? 1 : 0,
          derive_mothy: formData.derive_mothy ? 1 : 0,
          polmar_terre: formData.polmar_terre ? 1 : 0,
          smp: formData.smp ? 1 : 0,
          bsaa: formData.bsaa ? 1 : 0,
          sensible_proximite: formData.sensible_proximite ? 1 : 0,
          
          // Informations textuelles complémentaires
          delai_appareillage: formData.delai_appareillage || null,
          moyen_proximite: formData.moyen_proximite || null,
          risque_court_terme: formData.risque_court_terme || null,
          risque_moyen_long_terme: formData.risque_moyen_long_terme || null,
          moyen_depeche: formData.moyen_depeche || null,
          moyen_marine_etat: formData.moyen_marine_etat || null,
        }
      };

      console.log("Données envoyées au backend:", { rapport, metaData });

      // ═══════════════════════════════════════════════════════════════════════════════
      // ENVOI DES DONNÉES À L'API
      // ═══════════════════════════════════════════════════════════════════════════════
      
      const response = await axios.post(`${API}/rapports`, {
        rapport,
        metaData
      });

      console.log('Rapport créé avec succès:', response.data);
      setSubmitStatus({ type: 'success', message: 'Rapport enregistré avec succès!' });

      // Réinitialisation complète du formulaire après succès
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création du rapport:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement du rapport.'
      });
    } finally {
      setIsSubmitting(false);

      // Auto-effacement du message de succès après 5 secondes
      if (submitStatus?.type === 'success') {
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════════
  // RÉINITIALISATION DU FORMULAIRE
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Fonction de réinitialisation complète du formulaire.
   * Remet tous les champs à leurs valeurs par défaut et nettoie la carte.
   */
  const resetForm = () => {
    // Récupération de la date/heure actuelles pour les nouveaux défauts
    const now = new Date();
    
    setFormData({
      // Informations générales - remise à zéro
      titre: '',
      date_evenement: now.toISOString().split('T')[0], // Date actuelle
      heure_evenement: now.toISOString().split('T')[1].substring(0, 5), // Heure actuelle
      description_globale: '',
      
      // Classification - remise à zéro
      id_type_evenement: '',
      id_sous_type_evenement: '',
      id_origine_evenement: '',
      
      // Cible - remise à zéro
      libelle: '',
      nom_cible: '',
      pavillon_cible: '',
      
      // Localisation - remise à zéro
      id_zone: '',
      details_lieu: '',
      latitude: '',
      longitude: '',
      
      // Météorologie - remise à zéro
      direction_vent: '',
      force_vent: '',
      etat_mer: '',
      nebulosite: '',
      maree: '',
      
      // Alertes et moyens - remise à zéro (booléens à false)
      cedre_alerte: false,
      cross_alerte: false,
      photo: false,
      message_polrep: false,
      derive_mothy: false,
      polmar_terre: false,
      smp: false,
      bsaa: false,
      sensible_proximite: false,
      
      // Champs texte complémentaires - remise à zéro
      moyen_proximite: '',
      risque_court_terme: '',
      risque_moyen_long_terme: '',
      moyen_marine_etat: '',
      moyen_depeche: '',
      delai_appareillage: '',
      immatriculation: '',
      QuantiteProduit: '',
      TypeProduit: ''
    });

    // Nettoyage de la carte : suppression du marqueur
    if (marker && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(marker);
      setMarker(null);
    }

    // Recentrage de la carte sur la position par défaut (Brest)
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([48.3904, -4.4861], 10);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════════
  // RENDU DU COMPOSANT
  // ═══════════════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      className="rapport-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* En-tête du formulaire avec animation d'entrée */}
      <motion.div
        className="rapport-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="rapport-subtitle" style={{ fontSize: '0.9em', fontStyle: 'italic' }}>
          Complétez tous les champs obligatoires (*) pour soumettre un nouveau rapport
        </p>
      </motion.div>

      {/* Formulaire principal avec sections animées */}
      <motion.form
        className="rapport-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Section 1: Informations générales */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <GeneralInfoSection formData={formData} handleChange={handleChange} />
        </motion.div>
        
        {/* Section 2: Classification de l'événement */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <ClassificationSection
            formData={formData}
            handleChange={handleChange}
            typesEvenement={typesEvenement}
            filteredSousTypes={filteredSousTypes}
            originesEvenement={originesEvenement}
          />
        </motion.div>
        
        {/* Section 3: Informations sur la cible */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <TargetSection formData={formData} handleChange={handleChange} />
        </motion.div>
        
        {/* Section 4: Localisation avec carte interactive */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
          <LocalisationSection
            formData={formData}
            handleChange={handleChange}
            mapRef={mapRef}
            mapInitialized={mapInitialized}
            zonesGeographiques={zonesGeographiques}
          />
        </motion.div>
        
        {/* Section 5: Conditions météorologiques */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
          <MeteoSection formData={formData} handleChange={handleChange} />
        </motion.div>
        
        {/* Section 6: Alertes et moyens déployés */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
          <AlertesSection formData={formData} handleChange={handleChange} />
        </motion.div>
        
        {/* Section 7: Description détaillée */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <DescriptionSection formData={formData} handleChange={handleChange} />
        </motion.div>
        
        {/* Section 8: Boutons d'action du formulaire */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}>
          <FormActions
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
          />
        </motion.div>
      </motion.form>
      
      <br />
      
      {/* Message de statut avec animation d'apparition/disparition */}
      <AnimatePresence>
        {submitStatus && (
          <motion.div
            className={`status-message ${submitStatus.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            {submitStatus.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AjouterRapport;
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/AjouterRapport.css';
import 'leaflet/dist/leaflet.css';


import GeneralInfoSection from './AjouterRapport/GeneralInfoSection';
import ClassificationSection from './AjouterRapport/ClassificationSection';
import TargetSection from './AjouterRapport/TargetSection';
import LocalisationSection from './AjouterRapport/LocalisationSection';
import MeteoSection from './AjouterRapport/MeteoSection';
import AlertesSection from './AjouterRapport/AlertesSection';
import DescriptionSection from './AjouterRapport/DescriptionSection';
import FormActions from './AjouterRapport/FormActions';


const API = process.env.REACT_APP_API_URL;

const AjouterRapport = () => {
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [marker, setMarker] = useState(null);

  const [formData, setFormData] = useState(() => {
    // Get current date and time in local timezone
    const now = new Date();

    // Format date as YYYY-MM-DD for the date input
    const formattedDate = now.toISOString().split('T')[0];

    // Format time as HH:MM in local timezone for the time input
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return {
      titre: '',
      date_evenement: formattedDate,
      heure_evenement: formattedTime,
      description_globale: '',
      id_type_evenement: '',
      id_sous_type_evenement: '',
      id_origine_evenement: '',
      // Champs pour la cible de l'événement
      libelle: '',
      nom_cible: '',
      pavillon_cible: '',
      // Champs pour la localisation
      id_zone: '',
      details_lieu: '',
      latitude: '',
      longitude: '',
      // Conditions météorologiques
      direction_vent: '',
      force_vent: '',
      etat_mer: '',
      nebulosite: '',
      maree: '',
      // Contacts et alertes
      cedre_alerte: false,
      cross_alerte: false,
      photo: false,
      message_polrep: false,
      derive_mothy: false,
      polmar_terre: false,
      smp: false,
      bsaa: false,
      sensible_proximite: false,
      moyen_proximite: '',
      risque_court_terme: '',
      risque_moyen_long_terme: '',
      moyen_marine_etat: '',
      moyen_depeche: '',
      delai_appareillage: ''
    };
  });

  // États pour les listes déroulantes
  const [typesEvenement, setTypesEvenement] = useState([]);
  const [sousTypesEvenement, setSousTypesEvenement] = useState([]);
  const [originesEvenement, setOriginesEvenement] = useState([]);
  // const [typesCible, setTypesCible] = useState([]); // SUPPRIMÉ car inutilisé
  const [zonesGeographiques, setZonesGeographiques] = useState([]);
  const [filteredSousTypes, setFilteredSousTypes] = useState([]);

  // Récupération des données pour les listes déroulantes
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const [typesRes, sousTypesRes, originesRes, zonesRes/*, typesCibleRes*/] = await Promise.all([
          axios.get(`${API}/rapports/type-evenement`),
          axios.get(`${API}/rapports/sous-type-pollution`),
          axios.get(`${API}/rapports/origine-evenement`),
          axios.get(`${API}/rapports/zone-geographique`)
          // axios.get(`${API}/rapports/type-cible`) // SUPPRIMÉ car inutilisé
        ]);

        setTypesEvenement(typesRes.data);
        setSousTypesEvenement(sousTypesRes.data);
        setOriginesEvenement(originesRes.data);
        setZonesGeographiques(zonesRes.data);
        // setTypesCible(typesCibleRes.data); // SUPPRIMÉ car inutilisé
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchOptionsData();
  }, []);

  // Initialisation de la carte Leaflet
  useEffect(() => {
    // S'assurer que la carte est initialisée une seule fois et correctement
    if (mapRef.current && !mapInitialized && typeof window !== 'undefined') {
      // S'assurer que Leaflet est disponible
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';

        // Ajouter la feuille de style Leaflet si elle n'est pas déjà présente
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    }

    function initMap() {
      try {
        console.log("🗺️ Initialisation de la carte...");

        // Nettoyer la carte précédente si elle existe
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        // Centre par défaut - 
        const defaultCenter = [48.3904, -4.4861];

        // Créer la nouvelle carte
        leafletMapRef.current = window.L.map(mapRef.current).setView(defaultCenter, 10);

        // Ajouter la couche de tuiles OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapRef.current);

        // Ajouter un gestionnaire de clic sur la carte
        leafletMapRef.current.on('click', function (e) {
          const { lat, lng } = e.latlng;

          // Mettre à jour les champs de latitude et longitude dans le formulaire
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6)
          }));

          // Mettre à jour ou créer le marqueur
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            const newMarker = window.L.marker([lat, lng]).addTo(leafletMapRef.current);
            setMarker(newMarker);
          }

          console.log(`Position sélectionnée: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });

        // Force la mise à jour de la carte après l'initialisation
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

    // Nettoyer la carte au démontage du composant
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Mettre à jour la carte si les coordonnées sont modifiées manuellement
  useEffect(() => {
    if (mapInitialized && leafletMapRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Centrer la carte sur les coordonnées saisies manuellement
        leafletMapRef.current.setView([lat, lng], 12);

        // Mettre à jour ou créer le marqueur
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          const newMarker = window.L.marker([lat, lng]).addTo(leafletMapRef.current);
          setMarker(newMarker);
        }
      }
    }
  }, [formData.latitude, formData.longitude, mapInitialized, marker]); // Ajout de mapInitialized et marker

  // Filtrer les sous-types en fonction du type sélectionné
  useEffect(() => {
    if (formData.id_type_evenement) {
      const filtered = sousTypesEvenement.filter(
        sousType => sousType.id_type_evenement === parseInt(formData.id_type_evenement)
      );
      setFilteredSousTypes(filtered);
      // Réinitialiser le sous-type sélectionné si le type change
      if (!filtered.find(st => st.id_sous_type_evenement === parseInt(formData.id_sous_type_evenement))) {
        setFormData(prev => ({ ...prev, id_sous_type_evenement: '' }));
      }
    } else {
      setFilteredSousTypes([]);
      setFormData(prev => ({ ...prev, id_sous_type_evenement: '' }));
    }
  }, [formData.id_type_evenement, sousTypesEvenement, formData.id_sous_type_evenement]); // Ajout de formData.id_sous_type_evenement

  // Afficher le champ de délai d'appareillage seulement si BSAA est coché
  //const showDelaiAppareillage = formData.bsaa;

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Pour les checkboxes, utiliser la valeur de "checked" au lieu de "value"
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // Valider le formulaire avant soumission
  const validateForm = () => {
    // Vérifier les champs obligatoires
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

  // Fonction pour gérer l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Combiner la date et l'heure pour le backend
      //const dateTimeString = `${formData.date_evenement}T${formData.heure_evenement}:00`;

      // Créer une date locale
      const localDate = new Date(`${formData.date_evenement}T${formData.heure_evenement}:00`);

      // Convertir en UTC et formatter au format ISO
      const dateTimeUTC = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();





      const rapport = {
        titre: formData.titre,
        date_evenement: dateTimeUTC,
        description_globale: formData.description_globale,
        id_operateur: authData.Opid,
        id_type_evenement: formData.id_type_evenement ? parseInt(formData.id_type_evenement) : null,
        id_sous_type_evenement: formData.id_sous_type_evenement ? parseInt(formData.id_sous_type_evenement) : null,
        id_origine_evenement: formData.id_origine_evenement ? parseInt(formData.id_origine_evenement) : null,
      };


      // Données associées pour les tables connexes
      const metaData = {
        cible: {
          libelle: formData.libelle || null,
          nom_cible: formData.nom_cible || null,
          pavillon_cible: formData.pavillon_cible || null,
          immatriculation: formData.immatriculation || null,
          QuantiteProduit: formData.QuantiteProduit || null,
          TypeProduit: formData.TypeProduit || null,
        },
        localisation: {
          id_zone: formData.id_zone ? parseInt(formData.id_zone) : null,
          details_lieu: formData.details_lieu || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        },
        meteo: {
          direction_vent: formData.direction_vent || null,
          force_vent: formData.force_vent ? parseInt(formData.force_vent) : null,
          etat_mer: formData.etat_mer ? parseInt(formData.etat_mer) : null,
          nebulosite: formData.nebulosite ? parseInt(formData.nebulosite) : null,
          maree: formData.maree || null,
        },
        alertes: {
          cedre_alerte: formData.cedre_alerte ? 1 : 0,
          cross_alerte: formData.cross_alerte ? 1 : 0,
          photo: formData.photo ? 1 : 0,
          message_polrep: formData.message_polrep ? 1 : 0,
          derive_mothy: formData.derive_mothy ? 1 : 0,
          polmar_terre: formData.polmar_terre ? 1 : 0,
          smp: formData.smp ? 1 : 0,
          bsaa: formData.bsaa ? 1 : 0,
          sensible_proximite: formData.sensible_proximite ? 1 : 0,
          delai_appareillage: formData.delai_appareillage || null,
          moyen_proximite: formData.moyen_proximite || null,
          risque_court_terme: formData.risque_court_terme || null,
          risque_moyen_long_terme: formData.risque_moyen_long_terme || null,
          moyen_depeche: formData.moyen_depeche || null,
          moyen_marine_etat: formData.moyen_marine_etat || null,
        }
      };

      console.log("Données envoyées au backend:", { rapport, metaData });

      // Envoi des données au backend
      const response = await axios.post(`${API}/rapports`, {
        rapport,
        metaData
      });




      console.log('Rapport créé avec succès:', response.data);
      setSubmitStatus({ type: 'success', message: 'Rapport enregistré avec succès!' });

      // Réinitialisation du formulaire après succès
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création du rapport:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement du rapport.'
      });
    } finally {
      setIsSubmitting(false);

      // Effacer le message de statut après 5 secondes si c'est un succès
      if (submitStatus?.type === 'success') {
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      }
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      titre: '',
      date_evenement: new Date().toISOString().split('T')[0],
      heure_evenement: new Date().toISOString().split('T')[1].substring(0, 5),
      description_globale: '',
      id_type_evenement: '',
      id_sous_type_evenement: '',
      id_origine_evenement: '',
      libelle: '',
      nom_cible: '',
      pavillon_cible: '',
      id_zone: '',
      details_lieu: '',
      latitude: '',
      longitude: '',
      direction_vent: '',
      force_vent: '',
      etat_mer: '',
      nebulosite: '',
      maree: '',
      cedre_alerte: false,
      cross_alerte: false,
      photo: false,
      message_polrep: false,
      derive_mothy: false,
      polmar_terre: false,
      smp: false,
      bsaa: false,
      sensible_proximite: false,
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

    // Supprimer le marqueur de la carte
    if (marker && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(marker);
      setMarker(null);
    }

    // Recentrer la carte
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([48.3904, -4.4861], 10);
    }
  };

  // Reste du code (rendu du formulaire)...
  return (
    <div className="rapport-container">


      <div className="rapport-header">
        
        <p className="rapport-subtitle" style={{ fontSize: '0.9em', fontStyle: 'italic' }}>
          Complétez tous les champs obligatoires (*) pour soumettre un nouveau rapport
        </p>
      </div>



      <form className="rapport-form" onSubmit={handleSubmit}>
        <GeneralInfoSection formData={formData} handleChange={handleChange} />
        <ClassificationSection
          formData={formData}
          handleChange={handleChange}
          typesEvenement={typesEvenement}
          filteredSousTypes={filteredSousTypes}
          originesEvenement={originesEvenement}
        />
        <TargetSection formData={formData} handleChange={handleChange} />
        <LocalisationSection
          formData={formData}
          handleChange={handleChange}
          mapRef={mapRef}
          mapInitialized={mapInitialized}
          zonesGeographiques={zonesGeographiques}
        />
        <MeteoSection formData={formData} handleChange={handleChange} />
        <AlertesSection formData={formData} handleChange={handleChange} />
        <DescriptionSection formData={formData} handleChange={handleChange} />
        <FormActions
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />
      </form>
      <br></br>
      {submitStatus && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.message}
        </div>
      )}
    </div>

  );
};

export default AjouterRapport;
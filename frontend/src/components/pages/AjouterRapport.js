import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/AjouterRapport.css';
import 'leaflet/dist/leaflet.css';

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
  const [typesCible, setTypesCible] = useState([]);
  const [zonesGeographiques, setZonesGeographiques] = useState([]);
  const [filteredSousTypes, setFilteredSousTypes] = useState([]);

  // Récupération des données pour les listes déroulantes
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const [typesRes, sousTypesRes, originesRes, zonesRes, typesCibleRes] = await Promise.all([
          axios.get(`${API}/rapports/type-evenement`),
          axios.get(`${API}/rapports/sous-type-pollution`),
          axios.get(`${API}/rapports/origine-evenement`),
          axios.get(`${API}/rapports/zone-geographique`),
          axios.get(`${API}/rapports/type-cible`)
        ]);

        setTypesEvenement(typesRes.data);
        setSousTypesEvenement(sousTypesRes.data);
        setOriginesEvenement(originesRes.data);
        setZonesGeographiques(zonesRes.data);
        setTypesCible(typesCibleRes.data);
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

        // Centre par défaut - Marseille
        const defaultCenter = [43.2965, 5.3698];

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
  }, [formData.latitude, formData.longitude, mapInitialized, marker]);

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
  }, [formData.id_type_evenement, sousTypesEvenement]);

  // Afficher le champ de délai d'appareillage seulement si BSAA est coché
  const showDelaiAppareillage = formData.bsaa;

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
      const dateTimeString = `${formData.date_evenement}T${formData.heure_evenement}:00`;

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
      leafletMapRef.current.setView([43.2965, 5.3698], 10);
    }
  };

  // Reste du code (rendu du formulaire)...
  return (
    <div className="rapport-container">


      <div className="rapport-header">
        <h1 >Nouveau Rapport d'Événement</h1>
        <p className="rapport-subtitle" style={{ fontSize: '0.9em', fontStyle: 'italic' }}>
          Complétez tous les champs obligatoires (*) pour soumettre un nouveau rapport
        </p>
      </div>



      <form className="rapport-form" onSubmit={handleSubmit}>
        {/* Section Informations Générales */}
        <div className="form-section">
          <h2>Informations Générales</h2>

          <div className="form-group">
            <label htmlFor="titre">
              Titre du rapport *
              <span className="tooltip-icon" title="Donnez un titre court et descriptif">ℹ️</span>
            </label>
            <input
              id="titre"
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className="form-control"
              placeholder="Ex: Incident de déversement dans le secteur nord"
              required
              maxLength="200"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_evenement">
                Date de l'événement *
                <span className="tooltip-icon" title="Date à laquelle l'événement s'est produit">ℹ️</span>
              </label>
              <input
                id="date_evenement"
                type="date"
                name="date_evenement"
                value={formData.date_evenement}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="heure_evenement">
                Heure de l'événement *
                <span className="tooltip-icon" title="Heure à laquelle l'événement s'est produit">ℹ️</span>
              </label>
              <input
                id="heure_evenement"
                type="time"
                name="heure_evenement"
                value={formData.heure_evenement}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>
        </div>

        {/* Section Classification de l'Événement */}
        <div className="form-section">
          <h2>Classification de l'Événement</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="id_type_evenement">
                Type d'événement *
                <span className="tooltip-icon" title="Catégorie principale de l'événement">ℹ️</span>
              </label>
              <select
                id="id_type_evenement"
                name="id_type_evenement"
                value={formData.id_type_evenement}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">-- Sélectionner --</option>
                {typesEvenement.map(type => (
                  <option key={type.id_type_evenement} value={type.id_type_evenement}>
                    {type.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_sous_type_evenement">
                Précision du type d'événement
                <span className="tooltip-icon" title="Spécification du type d'événement">ℹ️</span>
              </label>
              <select
                id="id_sous_type_evenement"
                name="id_sous_type_evenement"
                value={formData.id_sous_type_evenement}
                onChange={handleChange}
                className="form-control"
                disabled={!formData.id_type_evenement}
              >
                <option value="">-- Sélectionner --</option>
                {filteredSousTypes.map(sousType => (
                  <option key={sousType.id_sous_type_evenement} value={sousType.id_sous_type_evenement}>
                    {sousType.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="id_origine_evenement">
              Origine de l'événement
              <span className="tooltip-icon" title="Source ou cause de l'événement">ℹ️</span>
            </label>
            <select
              id="id_origine_evenement"
              name="id_origine_evenement"
              value={formData.id_origine_evenement}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">-- Sélectionner --</option>
              {originesEvenement.map(origine => (
                <option key={origine.id_origine_evenement} value={origine.id_origine_evenement}>
                  {origine.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section pour la cible */}
        <div className="form-section">
          <h2>Cible de l'Événement</h2>

          <div className="form-group">
            <label htmlFor="libelle">
              Type de cible
              <span className="tooltip-icon" title="Type d'objet ou entité ciblé par l'événement">ℹ️</span>
            </label>
            <input
              type="text"
              id="libelle"
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              className="form-control"
              placeholder="Ex: Navire, Installation, etc."
            >
            </input>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom_cible">
                Nom de la cible
                <span className="tooltip-icon" title="Nom du navire, de l'installation, etc.">ℹ️</span>
              </label>
              <input
                id="nom_cible"
                type="text"
                name="nom_cible"
                value={formData.nom_cible}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: Navire Cargo XYZ"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pavillon_cible">
                Pavillon
                <span className="tooltip-icon" title="Pays d'enregistrement (pour navires)">ℹ️</span>
              </label>
              <input
                id="pavillon_cible"
                type="text"
                name="pavillon_cible"
                value={formData.pavillon_cible}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: France"
              />
            </div>

            <div className="form-group">
              <label htmlFor="immatriculation">
                Immatriculation
                <span className="tooltip-icon" title="MMSI/IMO Info immatriculation">ℹ️</span>
              </label>
              <input
                id="immatriculation"
                type="text"
                name="immatriculation"
                value={formData.immatriculation}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: MMSI/IMO Info immatriculation"
              />
            </div>
          </div>



          <div className="form-row">
            <div className="form-group">
              <label htmlFor="TypeProduit">
                Type Produit
                <span className="tooltip-icon" title="Type Produit">ℹ️</span>
              </label>
              <input
                id="TypeProduit"
                type="text"
                name="TypeProduit"
                value={formData.TypeProduit}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: fioul lourd, Huile, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="QuantiteProduit">
                Quantite Produit
                <span className="tooltip-icon" title="Quantite de Produit">ℹ️</span>
              </label>
              <input
                id="QuantiteProduit"
                type="text"
                name="QuantiteProduit"
                value={formData.QuantiteProduit}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: 1000L, 1000T, etc."
              />
            </div>
          </div>

        </div>

        {/* Section pour la localisation */}
        <div className="form-section">
          <h2>Localisation de l'Événement</h2>

          <div className="form-group">
            <label htmlFor="id_zone">
              Zone géographique *
              <span className="tooltip-icon" title="Mer ou zone maritime où s'est produit l'événement">ℹ️</span>
            </label>
            <select
              id="id_zone"
              name="id_zone"
              value={formData.id_zone}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">-- Sélectionner une zone --</option>
              {zonesGeographiques.map(zone => (
                <option key={zone.id_zone} value={zone.id_zone}>
                  {zone.nom_zone}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="details_lieu">
              Précision sur le lieu
              <span className="tooltip-icon" title="Description précise de l'emplacement">ℹ️</span>
            </label>
            <textarea
              id="details_lieu"
              name="details_lieu"
              value={formData.details_lieu}
              onChange={handleChange}
              className="form-control"
              placeholder="Décrivez l'emplacement précis (ex: 2 milles nautiques au sud du port de..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">
                Latitude
                <span className="tooltip-icon" title="Format décimal (ex: 43.296398)">ℹ️</span>
              </label>
              <input
                id="latitude"
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: 43.296398"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">
                Longitude
                <span className="tooltip-icon" title="Format décimal (ex: 5.369779)">ℹ️</span>
              </label>
              <input
                id="longitude"
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: 5.369779"
              />
            </div>
          </div>

          <div className="map-container">
            <label>Sélectionnez un point sur la carte (cliquez pour définir les coordonnées)</label>
            <div
              ref={mapRef}
              id="map"
              className="location-map"
              style={{ height: '300px', width: '100%', marginTop: '10px' }}
            >
              {!mapInitialized && <div className="map-loading">Chargement de la carte...</div>}
            </div>
          </div>
        </div>

        {/* Section pour les conditions météorologiques */}
        <div className="form-section">
          <h2>Conditions Météorologiques</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="direction_vent">
                Direction du vent
                <span className="tooltip-icon" title="Direction d'où vient le vent">ℹ️</span>
              </label>
              <select
                id="direction_vent"
                name="direction_vent"
                value={formData.direction_vent}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- Sélectionner --</option>
                <option value="N">Nord (N)</option>
                <option value="NE">Nord-Est (NE)</option>
                <option value="E">Est (E)</option>
                <option value="SE">Sud-Est (SE)</option>
                <option value="S">Sud (S)</option>
                <option value="SO">Sud-Ouest (SO)</option>
                <option value="O">Ouest (O)</option>
                <option value="NO">Nord-Ouest (NO)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="maree">
                Marée
                <span className="tooltip-icon" title="État actuel de la marée (observation au moment du rapport)">ℹ️</span>
              </label>
              <select
                id="maree"
                name="maree"
                value={formData.maree}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">-- Sélectionner --</option>
                <option value="haute">Haute mer</option>
                <option value="basse">Basse mer</option>
                <option value="montante">Marée montante</option>
                <option value="descendante">Marée descendante</option>
              </select>
            </div>


            <div className="form-group">
              <label htmlFor="force_vent">
                Force du vent (0-12)
                <span className="tooltip-icon" title="Échelle de Beaufort de 0 à 12">ℹ️</span>
              </label>
              <input
                type="range"
                id="force_vent"
                name="force_vent"
                min="0"
                max="12"
                value={formData.force_vent}
                onChange={handleChange}
                className="form-control-range"
              />
              <div className="range-value">{formData.force_vent || '0'}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="etat_mer">
                État de la mer (0-9)
                <span className="tooltip-icon" title="Échelle de Douglas de 0 à 9">ℹ️</span>
              </label>
              <input
                type="range"
                id="etat_mer"
                name="etat_mer"
                min="0"
                max="9"
                value={formData.etat_mer}
                onChange={handleChange}
                className="form-control-range"
              />
              <div className="range-value">{formData.etat_mer || '0'}</div>
            </div>

            <div className="form-group">
              <label htmlFor="nebulosite">
                Nébulosité (0-9)
                <span className="tooltip-icon" title="Échelle de couverture nuageuse de 0 à 9">ℹ️</span>
              </label>
              <input
                type="range"
                id="nebulosite"
                name="nebulosite"
                min="0"
                max="9"
                value={formData.nebulosite}
                onChange={handleChange}
                className="form-control-range"
              />
              <div className="range-value">{formData.nebulosite || '0'}</div>
            </div>
          </div>
        </div>

        {/* Section pour les contacts et alertes */}
        <div className="form-section">
          <h2>Contacts et Alertes</h2>

          <div className="checkbox-grid">
            <div className="checkbox-item">
              <input
                id="cedre_alerte"
                type="checkbox"
                name="cedre_alerte"
                checked={formData.cedre_alerte}
                onChange={handleChange}
              />
              <label htmlFor="cedre_alerte">CEDRE alerté</label>
            </div>

            <div className="checkbox-item">
              <input
                id="cross_alerte"
                type="checkbox"
                name="cross_alerte"
                checked={formData.cross_alerte}
                onChange={handleChange}
              />
              <label htmlFor="cross_alerte">CROSS alerté</label>
            </div>



            <div className="checkbox-item">
              <input
                id="photo"
                type="checkbox"
                name="photo"
                checked={formData.photo}
                onChange={handleChange}
              />
              <label htmlFor="photo">Photo</label>
            </div>

            <div className="checkbox-item">
              <input
                id="message_polrep"
                type="checkbox"
                name="message_polrep"
                checked={formData.message_polrep}
                onChange={handleChange}
              />
              <label htmlFor="message_polrep">POLREP</label>
            </div>

            <div className="checkbox-item">
              <input
                id="derive_mothy"
                type="checkbox"
                name="derive_mothy"
                checked={formData.derive_mothy}
                onChange={handleChange}
              />
              <label htmlFor="derive_mothy">Dérive MOTHY</label>
            </div>

            <div className="checkbox-item">
              <input
                id="polmar_terre"
                type="checkbox"
                name="polmar_terre"
                checked={formData.polmar_terre}
                onChange={handleChange}
              />
              <label htmlFor="polmar_terre">POLMAR Terre</label>
            </div>

            <div className="checkbox-item">
              <input
                id="smp"
                type="checkbox"
                name="smp"
                checked={formData.smp}
                onChange={handleChange}
              />
              <label htmlFor="smp">SMP</label>
            </div>

            <div className="checkbox-item">
              <input
                id="sensible_proximite"
                type="checkbox"
                name="sensible_proximite"
                checked={formData.sensible_proximite}
                onChange={handleChange}
              />
              <label htmlFor="sensible_proximite">Site sensible à proximité</label>
            </div>

            <div className="checkbox-item">
              <input
                id="bsaa"
                type="checkbox"
                name="bsaa"
                checked={formData.bsaa}
                onChange={handleChange}
              />
              <label htmlFor="bsaa">BSAA</label>
            </div>
          </div>

          {/* Afficher le délai d'appareillage seulement si BSAA est coché */}
          {showDelaiAppareillage && (
            <div className="form-group">
              <label htmlFor="delai_appareillage">
                Délai d'appareillage
                <span className="tooltip-icon" title="Date et heure d'appareillage pour BSAA">ℹ️</span>
              </label>
              <input
                id="delai_appareillage"
                type="datetime-local"
                name="delai_appareillage"
                value={formData.delai_appareillage}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          )}
          <br></br>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="moyen_proximite">Moyens à proximité</label>
              <input
                type="text"
                id="moyen_proximite"
                name="moyen_proximite"
                value={formData.moyen_proximite}
                onChange={handleChange}
                className="form-control"

              />
            </div>

            <div className="form-group">
              <label htmlFor="moyen_depeche">Moyens dépêchés sur zone</label>
              <input
                type="text"
                id="moyen_depeche"
                name="moyen_depeche"
                value={formData.moyen_depeche}
                onChange={handleChange}
                className="form-control"

              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="moyen_marine_etat">Moyens maritimes ou de l’État</label>
            <input
              type="text"
              id="moyen_marine_etat"
              name="moyen_marine_etat"
              value={formData.moyen_marine_etat}
              onChange={handleChange}
              className="form-control"

            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="risque_court_terme">Risque prévisible à court terme</label>
              <input
                type="text"
                id="risque_court_terme"
                name="risque_court_terme"
                value={formData.risque_court_terme}
                onChange={handleChange}
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="risque_moyen_long_terme">
                Risque prévisible à moyen et long terme
              </label>
              <input
                type="text"
                id="risque_moyen_long_terme"
                name="risque_moyen_long_terme"
                value={formData.risque_moyen_long_terme}
                onChange={handleChange}
                className="form-control"
                rows={3}
              />
            </div>
          </div>

        </div>

        {/* Section Description Détaillée */}
        <div className="form-section">
          <h2>Description Détaillée</h2>

          <div className="form-group">
            <label htmlFor="description_globale">
              Description globale de l'événement *
              <span className="tooltip-icon" title="Décrivez en détail ce qui s'est passé">ℹ️</span>
            </label>
            <textarea
              id="description_globale"
              name="description_globale"
              value={formData.description_globale}
              onChange={handleChange}
              className="form-control"
              placeholder="Décrivez l'événement de manière détaillée : que s'est-il passé, où, quand, comment..."
              required
              rows="6"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              // Réinitialiser le formulaire
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
              setSubmitStatus(null);
            }}
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le rapport'}
          </button>
        </div>
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
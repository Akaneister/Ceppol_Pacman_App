import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import '../css/AjouterRapport.css'; // Utilisation du même fichier CSS pour la cohérence visuelle

const API = process.env.REACT_APP_API_URL;

const ModifierRapport = () => {
  const { id } = useParams(); // récupère l'id depuis l'URL
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [marker, setMarker] = useState(null);

  // États pour les listes déroulantes
  const [typesEvenement, setTypesEvenement] = useState([]);
  const [sousTypesEvenement, setSousTypesEvenement] = useState([]);
  const [originesEvenement, setOriginesEvenement] = useState([]);
  const [typesCible, setTypesCible] = useState([]);
  const [zonesGeographiques, setZonesGeographiques] = useState([]);
  const [filteredSousTypes, setFilteredSousTypes] = useState([]);

  const [formData, setFormData] = useState({
    titre: '',
    date_evenement: '',
    heure_evenement: '',
    description_globale: '',
    id_type_evenement: '',
    id_sous_type_evenement: '',
    id_origine_evenement: '',
    // Champs pour la cible de l'événement
    id_cible: '',
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
    // Contacts et alertes
    cedre_alerte: false,
    cross_alerte: false,
    photo: false,
    polrep: false,
    derive_mothy: false,
    polmar_terre: false,
    smp: false,
    bsaa: false,
    delai_appareillage: ''
  });

  // Récupération des données pour les listes déroulantes et du rapport
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Récupération des données des listes déroulantes + du rapport
        const [
          typesRes,
          sousTypesRes,
          originesRes,
          zonesRes,
          typesCibleRes,
          rapportRes
        ] = await Promise.all([
          axios.get(`${API}/rapports/type-evenement`),
          axios.get(`${API}/rapports/sous-type-pollution`),
          axios.get(`${API}/rapports/origine-evenement`),
          axios.get(`${API}/rapports/zone-geographique`),
          axios.get(`${API}/rapports/type-cible`),
          axios.get(`${API}/rapports/${id}`)
        ]);
  
        console.log('Données du rapport:', rapportRes.data);
  
        setTypesEvenement(typesRes.data);
        setSousTypesEvenement(sousTypesRes.data);
        setOriginesEvenement(originesRes.data);
        setZonesGeographiques(zonesRes.data);
        setTypesCible(typesCibleRes.data);
  
        const rapportData = rapportRes.data.rapport;
        const metaData = rapportRes.data.metaData;
  
        let dateEvenement = '';
        let heureEvenement = '';
  
        if (rapportData.date_evenement) {
          const dateTime = new Date(rapportData.date_evenement);
          dateEvenement = dateTime.toISOString().split('T')[0];
          heureEvenement = dateTime.toTimeString().substring(0, 5);
        }
  
        const newFormData = {
          titre: rapportData.titre || '',
          date_evenement: dateEvenement,
          heure_evenement: heureEvenement,
          description_globale: rapportData.description_globale || '',
          id_type_evenement: rapportData.id_type_evenement?.toString() || '',
          id_sous_type_evenement: rapportData.id_sous_type_evenement?.toString() || '',
          id_origine_evenement: rapportData.id_origine_evenement?.toString() || '',
  
          // Cible
          id_cible: metaData.cible?.id_type_cible?.toString() || '',
          nom_cible: metaData.cible?.nom || '',
          pavillon_cible: metaData.cible?.pavillon || '',
  
          // Localisation
          id_zone: metaData.localisation?.id_zone?.toString() || '',
          details_lieu: metaData.localisation?.details_lieu || '',
          latitude: metaData.localisation?.latitude?.toString() || '',
          longitude: metaData.localisation?.longitude?.toString() || '',
  
          // Météo
          direction_vent: metaData.meteo?.direction_vent || '',
          force_vent: metaData.meteo?.force_vent?.toString() || '',
          etat_mer: metaData.meteo?.etat_mer?.toString() || '',
          nebulosite: metaData.meteo?.nebulosite?.toString() || '',
  
          // Alertes
          cedre_alerte: metaData.alertes?.cedre === 1,
          cross_alerte: metaData.alertes?.cross_contact === 1,
          photo: metaData.alertes?.photo === 1,
          polrep: metaData.alertes?.polrep === 1,
          derive_mothy: metaData.alertes?.derive_mothym === 1,
          polmar_terre: metaData.alertes?.pne === 1,
          smp: metaData.alertes?.smp === 1,
          bsaa: metaData.alertes?.bsaa === 1,
          delai_appareillage: metaData.alertes?.delai_appareillage_bsaa || ''
        };
  
        setFormData(newFormData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError('Impossible de charger les données du rapport.');
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  

  // Filtrer les sous-types en fonction du type sélectionné
  useEffect(() => {
    if (formData.id_type_evenement) {
      const filtered = sousTypesEvenement.filter(
        sousType => sousType.id_type_evenement === parseInt(formData.id_type_evenement)
      );
      setFilteredSousTypes(filtered);
    } else {
      setFilteredSousTypes([]);
    }
  }, [formData.id_type_evenement, sousTypesEvenement]);

  // Initialisation de la carte Leaflet
  useEffect(() => {
    // S'assurer que la carte est initialisée une seule fois et correctement
    if (mapRef.current && !mapInitialized && typeof window !== 'undefined' && formData.latitude && formData.longitude) {
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

        // Position initiale basée sur les coordonnées du rapport si disponibles
        const initialPosition = [
          parseFloat(formData.latitude) || 43.2965,
          parseFloat(formData.longitude) || 5.3698
        ];

        // Créer la nouvelle carte
        leafletMapRef.current = window.L.map(mapRef.current).setView(initialPosition, 10);

        // Ajouter la couche de tuiles OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(leafletMapRef.current);

        // Ajouter un marqueur à la position initiale si des coordonnées sont disponibles
        if (formData.latitude && formData.longitude) {
          const newMarker = window.L.marker(initialPosition).addTo(leafletMapRef.current);
          setMarker(newMarker);
        }

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
  }, [formData.latitude, formData.longitude]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

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

  // Validation du formulaire avant soumission
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

      // Préparation des données à envoyer selon la structure attendue par le backend
      const rapport = {
        titre: formData.titre,
        date_evenement: dateTimeString,
        description_globale: formData.description_globale,
        id_operateur: authData.Opid,
        // Convertir les ID en nombres
        id_type_evenement: formData.id_type_evenement ? parseInt(formData.id_type_evenement) : null,
        id_sous_type_evenement: formData.id_sous_type_evenement ? parseInt(formData.id_sous_type_evenement) : null,
        id_origine_evenement: formData.id_origine_evenement ? parseInt(formData.id_origine_evenement) : null,
      };

      // Données associées pour les tables connexes
      const metaData = {
        cible: {
          id_cible: formData.id_cible || null,
          nom_cible: formData.nom_cible || null,
          pavillon_cible: formData.pavillon_cible || null,
        },
        localisation: {
          id_zone: formData.id_zone? parseInt(formData.id_zone) : null,
          details_lieu: formData.details_lieu || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        },
        meteo: {
          direction_vent: formData.direction_vent || null,
          force_vent: formData.force_vent ? parseInt(formData.force_vent) : null,
          etat_mer: formData.etat_mer ? parseInt(formData.etat_mer) : null,
          nebulosite: formData.nebulosite ? parseInt(formData.nebulosite) : null,
        },
        alertes: {
          cedre_alerte: formData.cedre_alerte ? 1 : 0,
          cross_alerte: formData.cross_alerte ? 1 : 0,
          photo: formData.photo ? 1 : 0,
          polrep: formData.polrep ? 1 : 0,
          derive_mothy: formData.derive_mothy ? 1 : 0,
          polmar_terre: formData.polmar_terre ? 1 : 0,
          smp: formData.smp ? 1 : 0,
          bsaa: formData.bsaa ? 1 : 0,
          delai_appareillage: formData.delai_appareillage || null,
        }
      };

      console.log("Données envoyées au backend pour mise à jour:", { rapport, metaData });

      // Envoi des données au backend pour mise à jour
      const response = await axios.put(`${API}/rapports/${id}/after`, {
        rapport,
        metaData
      });

      console.log('Rapport mis à jour avec succès:', response.data);
      setSubmitStatus({ type: 'success', message: 'Rapport mis à jour avec succès!' });

      // Redirection après quelques secondes
      setTimeout(() => {
        navigate('/liste-rapports');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rapport:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du rapport.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Chargement des données du rapport...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h2>Erreur</h2>
      <p>{error}</p>
      <button className="btn-primary" onClick={() => navigate('/liste-rapports')}>
        Retour à la liste des rapports
      </button>
    </div>
  );

  // Afficher le champ de délai d'appareillage seulement si BSAA est coché
  const showDelaiAppareillage = formData.bsaa;

  return (
    <div className="rapport-container">
      <div className="rapport-header">
        <h1>Modification du Rapport #{id}</h1>
        <p className="rapport-subtitle">
          Modifiez les informations du rapport et cliquez sur "Enregistrer les modifications" pour valider
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
            <label htmlFor="id_cible">
              Type de cible
              <span className="tooltip-icon" title="Type d'objet ou entité ciblé par l'événement">ℹ️</span>
            </label>

            <select
              id="id_cible"
              name="id_cible"
              value={formData.id_cible}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">-- Sélectionner --</option>
              {typesCible.map(type => (
                <option key={type.id_type_cible} value={type.id_type_cible}>
                  {type.libelle}
                </option>
              ))}
            </select>
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
                step="1"
              />
              <div className="range-value">{formData.force_vent}</div>
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
                step="1"
              />
              <div className="range-value">{formData.etat_mer}</div>
            </div>

            <div className="form-group">
              <label htmlFor="nebulosite">
                Nébulosité (0-8)
                <span className="tooltip-icon" title="Couverture nuageuse (échelle de 0 à 8)">ℹ️</span>
              </label>
              <input
                type="range"
                id="nebulosite"
                name="nebulosite"
                min="0"
                max="8"
                value={formData.nebulosite}
                onChange={handleChange}
                className="form-control-range"
                step="1"
              />
              <div className="range-value">{formData.nebulosite}</div>
            </div>
          </div>
        </div>
        <div className="form-section">
          <h2>Alertes et Actions</h2>

          <div className="form-row checkbox-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="cedre_alerte"
                name="cedre_alerte"
                checked={formData.cedre_alerte}
                onChange={handleChange}
              />
              <label htmlFor="cedre_alerte">
                CEDRE alerté
                <span className="tooltip-icon" title="Centre de documentation, de recherche et d'expérimentations sur les pollutions accidentelles des eaux">ℹ️</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="cross_alerte"
                name="cross_alerte"
                checked={formData.cross_alerte}
                onChange={handleChange}
              />
              <label htmlFor="cross_alerte">
                CROSS alerté
                <span className="tooltip-icon" title="Centre Régional Opérationnel de Surveillance et de Sauvetage">ℹ️</span>
              </label>
            </div>
          </div>

          <div className="form-row checkbox-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="photo"
                name="photo"
                checked={formData.photo}
                onChange={handleChange}
              />
              <label htmlFor="photo">
                Photo disponible
              </label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="polrep"
                name="polrep"
                checked={formData.polrep}
                onChange={handleChange}
              />
              <label htmlFor="polrep">
                POLREP émis
                <span className="tooltip-icon" title="Pollution Report - Rapport de pollution">ℹ️</span>
              </label>
            </div>
          </div>

          <div className="form-row checkbox-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="derive_mothy"
                name="derive_mothy"
                checked={formData.derive_mothy}
                onChange={handleChange}
              />
              <label htmlFor="derive_mothy">
                Dérive MOTHY
                <span className="tooltip-icon" title="Modèle Océanique de Transport d'HYdrocarbures">ℹ️</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="polmar_terre"
                name="polmar_terre"
                checked={formData.polmar_terre}
                onChange={handleChange}
              />
              <label htmlFor="polmar_terre">
                POLMAR Terre
                <span className="tooltip-icon" title="Plan POLlution MARitime">ℹ️</span>
              </label>
            </div>
          </div>

          <div className="form-row checkbox-row">
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="smp"
                name="smp"
                checked={formData.smp}
                onChange={handleChange}
              />
              <label htmlFor="smp">
                SMP
                <span className="tooltip-icon" title="Surveillance Microbiologique des Plages">ℹ️</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="bsaa"
                name="bsaa"
                checked={formData.bsaa}
                onChange={handleChange}
              />
              <label htmlFor="bsaa">
                BSAA
                <span className="tooltip-icon" title="Bureau de Surveillance et d'Appui Administratif">ℹ️</span>
              </label>
            </div>
          </div>

          {/* Afficher conditionnellement le délai d'appareillage seulement si BSAA est coché */}
          {showDelaiAppareillage && (
            <div className="form-group">
              <label htmlFor="delai_appareillage">
                Délai d'appareillage
                <span className="tooltip-icon" title="Délai nécessaire avant intervention">ℹ️</span>
              </label>
              <input
                id="delai_appareillage"
                type="text"
                name="delai_appareillage"
                value={formData.delai_appareillage}
                onChange={handleChange}
                className="form-control"
                placeholder="Ex: 2 heures"
              />
            </div>
          )}
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

        {/* Section pour les boutons d'action */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/liste-rapports')}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
          </button>
        </div>

        {/* Affichage des messages de statut */}
        {submitStatus && (
          <div className={`status-message ${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ModifierRapport;
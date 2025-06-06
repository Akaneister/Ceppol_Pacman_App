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


  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const accesResponse = await axios.get(`${API}/rapports/${id}/acces`);
        const accesList = accesResponse.data;

        const rapportResponse = await axios.get(`${API}/rapports/${id}`);
        const rapport = rapportResponse.data.rapport || rapportResponse.data;

        const estCreateur = rapport.id_operateur === authData.Opid;
        const aAccess = accesList.some(acc => acc.id_operateur === authData.Opid);

        setHasAccess(estCreateur || aAccess);


        if (estCreateur || aAccess) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'accès :', error);
        setHasAccess(false);
      } finally {
        setAccessChecked(true);
      }
    };
    checkAccess();
  }, [authData, id]);



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
  const [typesCibleRes, setTypesCible] = useState([]);
  const [zonesGeographiques, setZonesGeographiques] = useState([]);
  const [filteredSousTypes, setFilteredSousTypes] = useState([]);



  const initialFormData = {
    titre: '',
    date_evenement: '',
    heure_evenement: '',
    description_globale: '',
    id_type_evenement: '',
    id_sous_type_evenement: '',
    id_origine_evenement: '',
    id_cible: '',
    nom_cible: '',
    pavillon_cible: '',
    libelle: '',
    immatriculation: '',
    TypeProduit: '',
    QuantiteProduit: '',
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
    moyen_depeche: '',
    moyen_marine_etat: '',
    risque_court_terme: '',
    risque_moyen_long_terme: '',
    delai_appareillage: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [ancienRapport, setAncienRapport] = useState(initialFormData);






  // Chargement des données du rapport et des listes déroulantes
  useEffect(() => {
    const fetchData = async () => {
      console.log('📥 Début du chargement des données du rapport et des listes déroulantes...');
      try {
        setLoading(true);
        setError('');

        console.log('🔄 Requêtes en cours vers l\'API...');
        const [
          typesRes,
          sousTypesRes,
          originesRes,
          zonesRes,
          typesCibleRes,
          rapportRes,
        ] = await Promise.all([
          axios.get(`${API}/rapports/type-evenement`),
          axios.get(`${API}/rapports/sous-type-pollution`),
          axios.get(`${API}/rapports/origine-evenement`),
          axios.get(`${API}/rapports/zone-geographique`),
          axios.get(`${API}/rapports/type-cible`),
          axios.get(`${API}/rapports/${id}`),
        ]);

        console.log('✅ Données des listes déroulantes récupérées avec succès.');

        // Mise à jour des listes
        setTypesEvenement(typesRes.data);
        setSousTypesEvenement(sousTypesRes.data);
        setOriginesEvenement(originesRes.data);
        setZonesGeographiques(zonesRes.data);
        setTypesCible(typesCibleRes.data);

        console.log('📦 Récupération et traitement des données du rapport...');
        const rapportData = rapportRes.data.rapport || rapportRes.data;
        const metaData = rapportRes.data.metaData || {};

        // 🧾 Affichage brut des données récupérées
        console.log('📄 Données du rapport récupérées :', rapportData);
        console.log('📄 MetaData associées :', metaData);

        // Formatage date/heure locale
        let dateEvenement = '';
        let heureEvenement = '';

        if (rapportData.date_evenement) {
          const dateObj = new Date(rapportData.date_evenement);
          dateEvenement = dateObj.toISOString().split('T')[0];
          heureEvenement = dateObj.toTimeString().substring(0, 5);
          console.log(`🕒 Date UTC reçue : ${rapportData.date_evenement} → affichée : ${dateEvenement} ${heureEvenement}`);
        }

        const newFormData = {
          titre: rapportData.titre || '',
          date_evenement: dateEvenement,
          heure_evenement: heureEvenement,
          description_globale: rapportData.description_globale || '',
          id_type_evenement: rapportData.id_type_evenement?.toString() || '',
          id_sous_type_evenement: rapportData.id_sous_type_evenement?.toString() || '',
          id_origine_evenement: rapportData.id_origine_evenement?.toString() || '',

          id_cible: metaData.cible?.id_type_cible?.toString() || '',
          nom_cible: metaData.cible?.nom || '',
          pavillon_cible: metaData.cible?.pavillon || '',
          libelle: metaData.typeCible?.libelle || '',
          immatriculation: metaData.cible?.immatriculation || '',
          TypeProduit: metaData.cible?.TypeProduit || '',
          QuantiteProduit: metaData.cible?.QuantiteProduit || '',

          id_zone: metaData.localisation?.id_zone?.toString() || '',
          details_lieu: metaData.localisation?.details_lieu || '',
          latitude: metaData.localisation?.latitude?.toString() || '',
          longitude: metaData.localisation?.longitude?.toString() || '',

          direction_vent: metaData.meteo?.direction_vent || '',
          force_vent: metaData.meteo?.force_vent?.toString() || '',
          etat_mer: metaData.meteo?.etat_mer?.toString() || '',
          nebulosite: metaData.meteo?.nebulosite?.toString() || '',
          maree: metaData.meteo?.maree || '',

          cedre_alerte: metaData.alertes?.cedre === 1,
          cross_alerte: metaData.alertes?.cross_contact === 1,
          photo: metaData.alertes?.photo === 1,
          message_polrep: metaData.alertes?.polrep === 1,
          derive_mothy: metaData.alertes?.derive_mothy === 1,
          polmar_terre: metaData.alertes?.pne === 1,
          smp: metaData.alertes?.smp === 1,
          bsaa: metaData.alertes?.bsaa === 1,
          sensible_proximite: metaData.alertes?.sensible_proximite === 1,

          moyen_proximite: metaData.alertes?.moyen_proximite || '',
          moyen_depeche: metaData.alertes?.moyen_depeche || '',
          moyen_marine_etat: metaData.alertes?.moyen_marine_etat || '',

          risque_court_terme: metaData.alertes?.risque_court_terme || '',
          risque_moyen_long_terme: metaData.alertes?.risque_moyen_long_terme || '',

          delai_appareillage: metaData.alertes?.delai_appareillage_bsaa || ''
        };

        console.log('📝 Formulaire prérempli avec :', newFormData);
        setFormData(newFormData);
        setAncienRapport(newFormData);

      } catch (err) {
        console.error('❌ Erreur lors du chargement des données :', err);
        setError('Impossible de charger les données du rapport.');
      } finally {
        setLoading(false);
        console.log('✅ Chargement terminé.');
      }
    };



    fetchData();
  }, [id]);




  // Supprimez le premier useEffect qui fait juste appel à chargerRapport()


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
          parseFloat(formData.latitude) ,
          parseFloat(formData.longitude) 
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

    // Vérifier si au moins un champ a été modifié
    const isModified = Object.keys(formData).some(
      key => formData[key] !== ancienRapport[key]
    );
    if (!isModified) {
      setSubmitStatus({
        type: 'error',
        message: 'Aucune modification détectée. Modifiez au moins un champ pour enregistrer.'
      });
      return false;
    }

    return true;
  };


  // Fonction pour gérer l'envoi du formulaire
  const handleArchiver = async (e) => {

    const confirmation = window.confirm("Voulez-vous vraiment archiver ce rapport ? Cette action est irréversible.");

    if (!confirmation) return;
    e.preventDefault();

    

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const dateTimeString = `${formData.date_evenement}T${formData.heure_evenement}:00`;

      const rapport = {
        titre: formData.titre,
        date_evenement: dateTimeString,
        description_globale: formData.description_globale,
        id_operateur: authData.Opid,
        id_type_evenement: formData.id_type_evenement ? parseInt(formData.id_type_evenement) : null,
        id_sous_type_evenement: formData.id_sous_type_evenement ? parseInt(formData.id_sous_type_evenement) : null,
        id_origine_evenement: formData.id_origine_evenement ? parseInt(formData.id_origine_evenement) : null,
        archive : 1 // Archiver le rapport
      };

      const metaData = {
        cible: {
          id_cible: formData.id_cible || null,
          nom_cible: formData.nom_cible || null,
          pavillon_cible: formData.pavillon_cible || null,
          libelle: formData.libelle || null,
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

      // Envoi du PUT vers l'API
      const response = await axios.put(`${API}/rapports/${id}/after`, {
        rapport,
        metaData
      });


      function genererDetailAction(ancien, nouveau) {
        console.log('Ancien rapport:', ancien);

        const modifications = [];

        // Parcours des champs du nouveau rapport
        for (const champ in nouveau) {
          const ancienVal = ancien[champ];
          const nouveauVal = nouveau[champ];

          // Si les valeurs sont différentes, on les ajoute aux modifications
          if (ancienVal !== nouveauVal) {
            modifications.push(`${champ} : "${ancienVal}" → "${nouveauVal}"`);
          }
        }

        // Retourne un message selon qu'il y ait des modifications ou non
        return modifications.length > 0
          ? `Champs modifiés :\n- ${modifications.join('\n- ')}`
          : 'Aucune modification détectée';
      }

      // Fonction pour formater la valeur (en tenant compte des valeurs null/undefined et autres types)
      function formatValeur(val) {
        if (val === null || val === undefined) {
          return ''; // Retourne une chaîne vide si la valeur est null ou undefined
        }

        // Si la valeur est un booléen, on la transforme en chaîne de caractères
        if (typeof val === 'boolean') {
          return val ? 'Oui' : 'Non';
        }

        // Si la valeur est un nombre, on retourne son formatage
        if (typeof val === 'number') {
          return val.toString();
        }

        // Pour les autres types de valeurs (chaînes, objets, tableaux, etc.), on retourne la valeur sous forme de chaîne
        return val.toString();
      }



      // GÉNÉRATION DU DETAIL_ACTION AVANCÉ
      const detail_action = genererDetailAction(ancienRapport, formData);

      console.log('detail_action:', detail_action);
      await axios.post(`${API}/rapports/historique`, {
        id_rapport: id,
        id_operateur: authData.Opid,
        type_action: 'Modification Rapport',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action
      });

      console.log('Rapport archivé avec succès:', response.data);
      setSubmitStatus({ type: 'success', message: 'Rapport mis à jour avec succès!' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const dateTimeString = `${formData.date_evenement}T${formData.heure_evenement}:00`;

      const rapport = {
        titre: formData.titre,
        date_evenement: dateTimeString,
        description_globale: formData.description_globale,
        id_operateur: authData.Opid,
        id_type_evenement: formData.id_type_evenement ? parseInt(formData.id_type_evenement) : null,
        id_sous_type_evenement: formData.id_sous_type_evenement ? parseInt(formData.id_sous_type_evenement) : null,
        id_origine_evenement: formData.id_origine_evenement ? parseInt(formData.id_origine_evenement) : null,
      };

      const metaData = {
        cible: {
          id_cible: formData.id_cible || null,
          nom_cible: formData.nom_cible || null,
          pavillon_cible: formData.pavillon_cible || null,
          libelle: formData.libelle || null,
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

      // Envoi du PUT vers l'API
      const response = await axios.put(`${API}/rapports/${id}/after`, {
        rapport,
        metaData
      });


      function genererDetailAction(ancien, nouveau) {
        console.log('Ancien rapport:', ancien);

        const modifications = [];

        // Parcours des champs du nouveau rapport
        for (const champ in nouveau) {
          const ancienVal = ancien[champ];
          const nouveauVal = nouveau[champ];

          // Si les valeurs sont différentes, on les ajoute aux modifications
          if (ancienVal !== nouveauVal) {
            modifications.push(`${champ} : "${ancienVal}" → "${nouveauVal}"`);
          }
        }

        // Retourne un message selon qu'il y ait des modifications ou non
        return modifications.length > 0
          ? `Champs modifiés :\n- ${modifications.join('\n- ')}`
          : 'Aucune modification détectée';
      }

      // Fonction pour formater la valeur (en tenant compte des valeurs null/undefined et autres types)
      function formatValeur(val) {
        if (val === null || val === undefined) {
          return ''; // Retourne une chaîne vide si la valeur est null ou undefined
        }

        // Si la valeur est un booléen, on la transforme en chaîne de caractères
        if (typeof val === 'boolean') {
          return val ? 'Oui' : 'Non';
        }

        // Si la valeur est un nombre, on retourne son formatage
        if (typeof val === 'number') {
          return val.toString();
        }

        // Pour les autres types de valeurs (chaînes, objets, tableaux, etc.), on retourne la valeur sous forme de chaîne
        return val.toString();
      }



      // GÉNÉRATION DU DETAIL_ACTION AVANCÉ
      const detail_action = genererDetailAction(ancienRapport, formData);

      console.log('detail_action:', detail_action);
      await axios.post(`${API}/rapports/historique`, {
        id_rapport: id,
        id_operateur: authData.Opid,
        type_action: 'Modification Rapport',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action
      });

      console.log('Rapport mis à jour avec succès:', response.data);
      setSubmitStatus({ type: 'success', message: 'Rapport mis à jour avec succès!' });

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


  if (!accessChecked) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="error-container">
        <h2>Accès refusé</h2>

        <p>Vous n'avez pas les droits pour modifier ce rapport.</p>
        <br></br>
        <button className="btn-primary" onClick={() => navigate('/liste-rapports')}>
          Retour à la liste des rapports
        </button>
      </div>
    );
  }




  // Afficher le champ de délai d'appareillage seulement si BSAA est coché
  const showDelaiAppareillage = formData.bsaa;

  return (



    <div className="rapport-container">


      <div className="rapport-header">
        <h1 >Modifier Un rapport d'Evenement</h1>
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
            type="submit"
            className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Modification ...' : 'Modifier le rapport'}
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleArchiver}
            style={{ backgroundColor: '#a00', color: 'white', padding: '10px 20px', fontSize: '1rem', marginTop: '1rem' }}
          >
            🗃️ Archiver ce rapport
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

export default ModifierRapport;
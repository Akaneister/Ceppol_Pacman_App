/**
==================================================================================
==================================================================================
@file ListeRapport.js
@location frontend/src/components/pages/ListeRapport.js
@description Composant principal pour la gestion complète des rapports CEPPOL
FONCTIONNALITÉS PRINCIPALES :
────────────────────────────────────────────────────────────────────────────────
• Affichage de la liste complète des rapports avec pagination
• Recherche textuelle avancée dans tous les champs de rapport
• Système de filtrage multi-critères (type, sous-type, origine, zone, dates)
• Visualisation détaillée des rapports avec modal interactive
• Gestion de l'historique des actions sur chaque rapport
• Système de permissions et gestion des accès utilisateurs
• Export PDF complet des rapports avec mise en forme
• Téléchargement de l'historique au format texte
• Modification en ligne des rapports existants
• Ajout d'historique manuel par les utilisateurs autorisés

SYSTÈME DE PERMISSIONS :
────────────────────────────────────────────────────────────────────────────────
• Opérateur créateur : accès complet au rapport
• Opérateurs avec droits d'accès : modification autorisée
• Autres utilisateurs : consultation uniquement
• Gestion dynamique des accès par rapport

STRUCTURE DU COMPOSANT :
────────────────────────────────────────────────────────────────────────────────
• Barre de recherche : Recherche textuelle globale
• Panneau de filtres : Filtrage par critères multiples
• Tableau des rapports : Liste paginée avec actions contextuelles
• Modal détails : Affichage complet d'un rapport
• Modal historique : Chronologie des actions
• Modal gestion accès : Attribution/retrait des droits

DÉPENDANCES :
────────────────────────────────────────────────────────────────────────────────
• React (hooks: useState, useEffect, useRef)
• AuthContext (authentification et droits utilisateur)
• Axios (requêtes API)
• Framer Motion (animations et transitions)
• jsPDF (génération de documents PDF)
• Lucide React (icônes)
• Composants enfants : Filtres, RapportsTable, DetailsRapport, GestionAccesModal

API UTILISÉE :
────────────────────────────────────────────────────────────────────────────────
• GET /rapports - Liste des rapports
• GET /rapports/type-evenement - Types d'événements
• GET /rapports/sous-type-pollution - Sous-types de pollution
• GET /rapports/origine-evenement - Origines d'événements
• GET /rapports/zone-geographique - Zones géographiques
• GET /rapports/operateurs - Liste des opérateurs
• GET /rapports/historique/:id - Historique d'un rapport
• GET /rapports/:id/acces - Accès d'un rapport
• POST /rapports/:id/acces - Ajout d'accès
• DELETE /rapports/:id/acces/:operateur - Suppression d'accès
• POST /rapports/historique - Ajout d'historique manuel

@author Oscar Vieujean
==================================================================================
*/

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/ListeRapport.css';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

import Filtres from './ListeRapport/Filtres';
import RapportsTable from "./ListeRapport/RapportsTable";
import DetailsRapport from './ListeRapport/DetailsRapport';
import GestionAccesModal from './ListeRapport/GestionAccessModal';
const ListeRapport = () => {
  // =========================
  // ÉTATS PRINCIPAUX DU COMPOSANT
  // =========================
  
  /** @desc Liste complète des rapports récupérés depuis l'API */
  const [rapports, setRapports] = useState([]);
  
  /** @desc État de chargement pour l'affichage du loader */
  const [loading, setLoading] = useState(true);
  
  /** @desc Messages d'erreur à afficher à l'utilisateur */
  const [error, setError] = useState(null);

  // =========================
  // DONNÉES DE RÉFÉRENCE POUR LES FILTRES
  // =========================
  
  /** @desc Liste des types d'événements disponibles (ex: Pollution, Accident) */
  const [typeEvenements, setTypeEvenements] = useState([]);
  
  /** @desc Liste des sous-types d'événements (ex: Hydrocarbures, Chimique) */
  const [sousTypeEvenements, setSousTypeEvenements] = useState([]);
  
  /** @desc Liste des origines d'événements (ex: Navire, Installation portuaire) */
  const [origineEvenements, setOrigineEvenements] = useState([]);
  
  /** @desc Liste des zones géographiques de surveillance */
  const [zones, setZones] = useState([]);
  
  /** @desc Liste de tous les opérateurs du système */
  const [operateurs, setOperateurs] = useState([]);

  // =========================
  // SYSTÈME DE FILTRAGE ET RECHERCHE
  // =========================
  
  /** @desc Indicateur si des filtres sont appliqués */
  const [filtreActif, setFiltreActif] = useState(false);
  
  /** @desc Terme de recherche textuelle dans tous les champs */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @desc Objet contenant tous les critères de filtrage actifs */
  const [filtres, setFiltres] = useState({
    type: '',           // ID du type d'événement
    sousType: '',       // ID du sous-type d'événement  
    origine: '',        // ID de l'origine d'événement
    zone: '',           // ID de la zone géographique
    dateDebut: '',      // Date de début pour filtrage temporel
    dateFin: '',        // Date de fin pour filtrage temporel
    archive: '0'        // Statut d'archivage (0=actif, 1=archivé)
  });

  // =========================
  // GESTION DE L'AFFICHAGE ET SÉLECTION
  // =========================
  
  /** @desc Rapport actuellement sélectionné pour affichage détaillé */
  const [rapportSelectionne, setRapportSelectionne] = useState(null);
  
  /** @desc Contrôle l'affichage de la vue historique dans la modal */
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  
  /** @desc Contrôle l'affichage du formulaire d'ajout d'historique */
  const [afficherAjoutHistorique, setAfficherAjoutHistorique] = useState(false);
  
  /** @desc Contrôle l'affichage de la modal de gestion des accès */
  const [afficherGestionAcces, setAfficherGestionAcces] = useState(false);

  // =========================
  // SYSTÈME DE GESTION DES ACCÈS UTILISATEURS
  // =========================
  
  /** @desc Liste des opérateurs ayant accès au rapport sélectionné */
  const [operateursAvecAcces, setOperateursAvecAcces] = useState([]);
  
  /** @desc ID de l'opérateur à ajouter aux accès */
  const [nouvelOperateurAcces, setNouvelOperateurAcces] = useState('');
  
  /** @desc Matrice des droits d'accès : {id_rapport: [id_operateur1, id_operateur2...]} */
  const [droitsAcces, setDroitsAcces] = useState({});

  // =========================
  // GESTION DE L'HISTORIQUE DES RAPPORTS
  // =========================
  
  /** @desc Données complètes de l'historique du rapport sélectionné */
  const [historiqueData, setHistoriqueData] = useState(null);
  
  /** @desc Formulaire pour ajouter un nouvel élément d'historique */
  const [nouvelHistorique, setNouvelHistorique] = useState({
    type_action: '',      // Type d'action (ex: OBSERVATION, INTERVENTION)
    detail_action: ''     // Description détaillée de l'action
  });

  // =========================
  // CONTRÔLES D'INTERFACE UTILISATEUR
  // =========================
  
  /** @desc Contrôle l'ouverture/fermeture du panneau de filtres */
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  // =========================
  // AUTHENTIFICATION ET AUTORISATIONS
  // =========================
  
  /** @desc Données d'authentification de l'utilisateur courant */
  const { authData } = useAuth();

  // =========================
  // RÉFÉRENCES DOM POUR LES MODALS
  // =========================
  
  /** @desc Référence pour la modal principale (détails/historique) */
  const modalRef = useRef(null);
  
  /** @desc Référence pour la modal de gestion des accès */
  const accessModalRef = useRef(null);

  // =========================
  // CONFIGURATION API
  // =========================
  
  /** @desc URL de base de l'API backend */
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // =========================
  // FONCTIONS DE GESTION DES DONNÉES API
  // =========================

  /**
   * Récupère tous les droits d'accès depuis l'API et les organise par rapport
   * @desc Construit un objet de la forme {id_rapport: [id_operateur1, id_operateur2...]}
   * @async
   */
  const fetchDroitsAcces = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rapports/acces/all`);
      const droits = {};
      res.data.forEach(droit => {
        if (!droits[droit.id_rapport]) droits[droit.id_rapport] = [];
        droits[droit.id_rapport].push(droit.id_operateur);
      });
      setDroitsAcces(droits);
    } catch (err) {
      console.error("Erreur lors de la récupération des droits d'accès:", err);
    }
  };

  // =========================
  // EFFET DE CHARGEMENT INITIAL - RÉCUPÉRATION DES DONNÉES
  // =========================
  
  /**
   * Effet principal de chargement des données au montage du composant
   * @desc Récupère en parallèle toutes les données nécessaires :
   * - Liste des rapports
   * - Données de référence pour les filtres (types, sous-types, etc.)
   * - Droits d'accès utilisateurs
   */
  useEffect(() => {
    if (!API_BASE_URL) return; // Vérification de la configuration API
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupération en parallèle de toutes les données nécessaires
        const [
          rapportsRes,
          typeEvRes,
          sousTypeEvRes,
          origineEvRes,
          zonesRes,
          operateursRes
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/rapports`),
          axios.get(`${API_BASE_URL}/rapports/type-evenement`),
          axios.get(`${API_BASE_URL}/rapports/sous-type-pollution`),
          axios.get(`${API_BASE_URL}/rapports/origine-evenement`),
          axios.get(`${API_BASE_URL}/rapports/zone-geographique`),
          axios.get(`${API_BASE_URL}/rapports/operateurs`)
        ]);
        
        // Mise à jour des états avec les données récupérées
        setRapports(rapportsRes.data);
        setTypeEvenements(typeEvRes.data);
        setSousTypeEvenements(sousTypeEvRes.data);
        setOrigineEvenements(origineEvRes.data);
        setZones(zonesRes.data);
        setOperateurs(operateursRes.data);

        // Chargement des droits d'accès
        await fetchDroitsAcces();
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [API_BASE_URL]);

  // =========================
  // FONCTIONS UTILITAIRES DE TRANSFORMATION DES DONNÉES
  // =========================

  /**
   * Récupère le libellé d'un type d'événement par son ID
   * @param {number} id - ID du type d'événement
   * @returns {string} Libellé du type d'événement ou 'Non défini'
   */
  const getTypeEvenementLibelle = (id) =>
    typeEvenements.find(t => t.id_type_evenement === id)?.libelle || 'Non défini';

  /**
   * Récupère le libellé d'un sous-type d'événement par son ID
   * @param {number} id - ID du sous-type d'événement
   * @returns {string} Libellé du sous-type d'événement ou 'Non défini'
   */
  const getSousTypeEvenementLibelle = (id) =>
    sousTypeEvenements.find(st => st.id_sous_type_evenement === id)?.libelle || 'Non défini';

  /**
   * Récupère le libellé d'une origine d'événement par son ID
   * @param {number} id - ID de l'origine d'événement
   * @returns {string} Libellé de l'origine d'événement ou 'Non défini'
   */
  const getOrigineEvenementLibelle = (id) =>
    origineEvenements.find(o => o.id_origine_evenement === id)?.libelle || 'Non défini';

  /**
   * Récupère le nom d'une zone géographique par son ID
   * @param {number} id - ID de la zone géographique
   * @returns {string} Nom de la zone ou 'Non définie'
   */
  const getZoneNom = (id) =>
    zones.find(z => z.id_zone === id)?.nom_zone || 'Non définie';

  /**
   * Récupère le nom complet d'un opérateur par son ID
   * @param {number} id - ID de l'opérateur
   * @returns {string} Nom complet de l'opérateur (prénom + nom) ou ID formaté
   */
  const getOperateurNom = (id) => {
    const op = operateurs.find(o => o.id_operateur === id);
    return op ? `${op.prenom} ${op.nom}` : `Opérateur ID ${id}`;
  };

  /**
   * Formate une date au format français avec heure
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée (DD/MM/YYYY HH:MM)
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Vérifie si l'utilisateur courant peut modifier le rapport sélectionné
   * @param {Object} rapport - Objet rapport à vérifier
   * @returns {boolean} true si l'utilisateur peut modifier, false sinon
   * @desc Un utilisateur peut modifier s'il est :
   * - Le créateur du rapport (id_operateur)
   * - Ou s'il a des droits d'accès explicites sur ce rapport
   */
  const userPeutModifier = (rapport) => {
    if (!authData || !rapport) return false;
    const userId = authData.Opid;
    
    // Vérification si l'utilisateur est le créateur
    if (rapport.id_operateur === userId) return true;
    
    // Vérification des droits d'accès explicites
    const acces = droitsAcces[rapport.id_rapport] || [];
    return acces.includes(userId);
  };

  // =========================
  // FONCTIONS DE GESTION DES DONNÉES API - OPÉRATIONS CRUD
  // =========================

  /**
   * Récupère l'historique complet d'un rapport spécifique
   * @param {number} idRapport - ID du rapport dont on veut l'historique
   * @returns {Array} Tableau des actions d'historique ou tableau vide en cas d'erreur
   * @async
   */
  const fetchHistorique = async (idRapport) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/rapports/historique/${idRapport}`);
      return res.data;
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err);
      setError("Une erreur est survenue lors du chargement de l'historique.");
      return [];
    }
  };

  /**
   * Récupère tous les rapports depuis l'API et met à jour les droits d'accès
   * @desc Utilisé pour réinitialiser la vue après modifications
   * @async
   */
  const fetchRapports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/rapports`);
      setRapports(res.data);
      await fetchDroitsAcces(); // Mise à jour des droits d'accès
    } catch (err) {
      console.error("Erreur lors de la récupération des rapports:", err);
      setError("Une erreur est survenue lors du chargement des rapports.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GESTIONNAIRES D'ÉVÉNEMENTS UI ET ACTIONS UTILISATEUR
  // =========================

  /**
   * Gestionnaire de changement du terme de recherche
   * @param {Event} e - Événement de changement du champ de recherche
   */
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  /**
   * Gestionnaire de changement des filtres
   * @param {Event} e - Événement de changement d'un champ de filtre
   * @desc Met à jour l'objet filtres avec la nouvelle valeur
   */
  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Réinitialise tous les filtres et recharge les rapports
   * @desc Remet tous les filtres à leur état initial et recharge la liste complète
   * @async
   */
  const reinitialiserFiltres = async () => {
    setFiltres({
      type: '',
      sousType: '',
      origine: '',
      zone: '',
      dateDebut: '',
      dateFin: ''
    });
    setSearchTerm('');
    setFiltreActif(false);
    await fetchRapports();
  };

  /**
   * Bascule l'affichage du panneau de filtres (ouvert/fermé)
   */
  const toggleFiltres = () => setFiltresOuverts(prev => !prev);

  /**
   * Gestionnaire de changement des champs du formulaire d'historique
   * @param {Event} e - Événement de changement d'un champ du formulaire
   */
  const handleHistoriqueChange = (e) => {
    const { name, value } = e.target;
    setNouvelHistorique(prev => ({ ...prev, [name]: value }));
  };

  // =========================
  // GESTION DES MODALS ET AFFICHAGE DES DÉTAILS
  // =========================

  /**
   * Ouvre la modal de détails d'un rapport
   * @param {Object} rapport - Objet rapport à afficher en détail
   * @desc Charge l'historique du rapport et ouvre la modal en mode détails
   * @async
   */
  const voirDetails = async (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(false);
    setAfficherGestionAcces(false);
    setHistoriqueData(await fetchHistorique(rapport.id_rapport));
    modalRef.current?.classList.add('active');
  };

  /**
   * Ouvre la modal en mode historique d'un rapport
   * @param {Object} rapport - Objet rapport dont on veut voir l'historique
   * @desc Charge l'historique du rapport et ouvre la modal en mode historique
   * @async
   */
  const voirHistorique = async (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(true);
    setAfficherGestionAcces(false);
    setHistoriqueData(await fetchHistorique(rapport.id_rapport));
    modalRef.current?.classList.add('active');
  };

  /**
   * Ferme la modal principale et remet à zéro tous les états
   * @desc Nettoie tous les états liés à la modal pour éviter les conflits
   */
  const fermerModal = () => {
    setRapportSelectionne(null);
    setAfficherHistorique(false);
    setAfficherAjoutHistorique(false);
    setAfficherGestionAcces(false);
    setHistoriqueData(null);
  };

  // =========================
  // GESTION DES ACCÈS UTILISATEURS AUX RAPPORTS
  // =========================

  /**
   * Ouvre la modal de gestion des accès pour un rapport
   * @param {Object} rapport - Rapport pour lequel gérer les accès
   * @desc Charge la liste des opérateurs ayant accès au rapport et ouvre la modal
   * @async
   */
  const ouvrirGestionAcces = async (rapport) => {
    setRapportSelectionne(rapport); // Définir le rapport en premier
    try {
      const res = await axios.get(`${API_BASE_URL}/rapports/${rapport.id_rapport}/acces`);
      setOperateursAvecAcces(res.data);
      setAfficherGestionAcces(true);
      accessModalRef.current?.classList.add('active');
    } catch (err) {
      setError("Une erreur est survenue lors du chargement des accès.");
    }
  };

  /**
   * Ferme la modal de gestion des accès et nettoie le formulaire
   */
  const fermerGestionAcces = () => {
    accessModalRef.current?.classList.remove('active');
    setNouvelOperateurAcces('');
  };

  /**
   * Gestionnaire de changement du champ opérateur à ajouter
   * @param {Event} e - Événement de changement du champ select
   */
  const handleNouvelOperateurChange = (e) => setNouvelOperateurAcces(e.target.value);

  /**
   * Ajoute un accès opérateur à un rapport
   * @desc Accorde les droits de modification à un opérateur et enregistre l'action dans l'historique
   * @async
   */
  const ajouterAccesOperateur = async () => {
    if (!nouvelOperateurAcces || !rapportSelectionne) return;
    
    try {
      // Ajout des droits d'accès
      await axios.post(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`, {
        id_operateur: nouvelOperateurAcces,
        peut_modifier: true
      });
      
      // Enregistrement dans l'historique avec décalage horaire (+2h)
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: nouvelOperateurAcces,
        type_action: 'AJOUT_D_ACCES',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: ''
      });
      
      // Mise à jour des données affichées
      const res = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(res.data);
      await fetchDroitsAcces();
      setNouvelOperateurAcces('');
    } catch (err) {
      console.error("Erreur lors de l'ajout d'accès:", err);
      setError("Une erreur est survenue lors de l'ajout d'accès.");
    }
  };

  /**
   * Retire un accès opérateur d'un rapport
   * @param {number} idOperateur - ID de l'opérateur dont retirer l'accès
   * @desc Supprime les droits de modification et enregistre l'action dans l'historique
   * @async
   */
  const retirerAccesOperateur = async (idOperateur) => {
    try {
      // Suppression des droits d'accès
      await axios.delete(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces/${idOperateur}`);
      
      // Mise à jour de la liste affichée
      const res = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(res.data);
      
      // Enregistrement dans l'historique avec décalage horaire (+2h)
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: idOperateur,
        type_action: 'RETRAIT_D_ACCES',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: ''
      });
      
      await fetchDroitsAcces();
    } catch (err) {
      console.error("Erreur lors du retrait d'accès:", err);
      setError("Une erreur est survenue lors du retrait d'accès.");
    }
  };

  // =========================
  // GESTION DE L'HISTORIQUE ET MODIFICATIONS
  // =========================

  /**
   * Ajoute un historique manuel à un rapport
   * @desc Permet aux utilisateurs autorisés d'ajouter des entrées d'historique personnalisées
   * @async
   */
  const ajouterHistoriqueManuel = async () => {
    try {
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: authData.Opid,
        type_action: nouvelHistorique.type_action,
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: nouvelHistorique.detail_action
      });
      
      // Mise à jour de l'affichage de l'historique
      setHistoriqueData(await fetchHistorique(rapportSelectionne.id_rapport));
      setNouvelHistorique({ type_action: '', detail_action: '' });
      setAfficherAjoutHistorique(false);
      setAfficherHistorique(true);
    } catch (err) {
      console.error("Erreur lors de l'ajout d'un historique manuel:", err);
      setError("Une erreur est survenue lors de l'ajout d'un historique manuel.");
    }
  };

  /**
   * Redirige vers la page de modification du rapport
   * @param {number} idRapport - ID du rapport à modifier
   * @desc Navigation simple vers l'interface de modification
   */
  const modifierRapport = (idRapport) => {
    window.location.href = `/modifier-rapport/${idRapport}`;
  };

  // =========================
  // FONCTIONS D'EXPORT ET TÉLÉCHARGEMENT
  // =========================

  /**
   * Télécharge l'historique d'un rapport au format texte structuré
   * @param {Object} rapport - Rapport dont télécharger l'historique
   * @desc Génère un fichier .txt avec l'historique formaté en tableau
   * @async
   */
  const telechargerHistorique = async (rapport) => {
    try {
      const historique = await fetchHistorique(rapport.id_rapport);
      
      if (historique && historique.length > 0) {
        // Création de l'en-tête du tableau
        let txtContent = "Type d'action       | Détails                             | Opérateur         | Date\n";
        txtContent += "--------------------|-------------------------------------|-------------------|---------------------\n";
        
        // Ajout de chaque ligne d'historique
        historique.forEach(action => {
          const operateurNom = getOperateurNom(action.id_operateur);
          const dateFormatee = formatDate(action.date_action);
          const detailAction = action.detail_action
            ? action.detail_action.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
            : "";
          
          // Formatage des colonnes avec padding
          const typeAction = action.type_action.padEnd(20);
          const details = detailAction.slice(0, 35).padEnd(35);
          const operateur = operateurNom.padEnd(19);
          const date = dateFormatee.padEnd(20);
          
          txtContent += `${typeAction}| ${details}| ${operateur}| ${date}\n`;
        });
        
        // Création et téléchargement du fichier
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `historique_rapport_${rapport.id_rapport}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("Aucun historique disponible pour ce rapport.");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'historique :", error);
      alert("Une erreur est survenue lors du téléchargement de l'historique.");
    }
  };

  /**
   * Génère et télécharge un PDF complet avec toutes les informations du rapport
   * @param {Object} rapport - Rapport à exporter en PDF
   * @desc Crée un document PDF professionnel avec mise en forme CEPPOL
   */
  const telechargerPDFRapport = (rapport) => {
    const doc = new jsPDF();
    let y = 15;
    
    // En-tête du document avec style CEPPOL
    doc.setFontSize(18);
    doc.setTextColor(0, 70, 140);
    doc.text('Fiche Rapport - CEPPOL', 105, y, { align: 'center' });
    y += 10;
    doc.setDrawColor(0, 70, 140);
    doc.setLineWidth(0.8);
    doc.line(10, y, 200, y);
    y += 8;
    
    // Informations principales du rapport
    doc.setFontSize(12);
    doc.setTextColor(0,0,0);
    doc.text(`ID Rapport : ${rapport.id_rapport || ''}`, 10, y);
    y += 8;
    doc.text(`Titre : ${rapport.titre || ''}`, 10, y);
    y += 8;
    doc.text(`Type d'événement : ${getTypeEvenementLibelle(rapport.id_type_evenement)}`, 10, y);
    y += 8;
    doc.text(`Sous-type : ${getSousTypeEvenementLibelle(rapport.id_sous_type_evenement)}`, 10, y);
    y += 8;
    doc.text(`Origine : ${getOrigineEvenementLibelle(rapport.id_origine_evenement)}`, 10, y);
    y += 8;
    doc.text(`Zone : ${getZoneNom(rapport.id_zone)}`, 10, y);
    y += 8;
    doc.text(`Date de l'événement : ${formatDate(rapport.date_evenement)}`, 10, y);
    y += 8;
    doc.text(`Date de création : ${formatDate(rapport.date_creation)}`, 10, y);
    y += 8;
    doc.text(`Dernière modification : ${formatDate(rapport.date_modification)}`, 10, y);
    y += 8;
    doc.text(`Opérateur principal : ${getOperateurNom(rapport.id_operateur)}`, 10, y);
    y += 8;
    doc.text(`Statut : ${rapport.statut || 'Non défini'}`, 10, y);
    y += 8;
    doc.text(`Archivé : ${rapport.archive === 1 ? 'Oui' : 'Non'}`, 10, y);
    y += 10;
    
    // Description globale
    doc.setFontSize(13);
    doc.setTextColor(0, 70, 140);
    doc.text('Description globale :', 10, y);
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(0,0,0);
    const description = rapport.description_globale || '';
    const splitDesc = doc.splitTextToSize(description, 185);
    doc.text(splitDesc, 10, y);
    y += splitDesc.length * 6 + 2;
    
    // Autres informations si présentes
    if (rapport.autres_infos) {
      doc.setFontSize(13);
      doc.setTextColor(0, 70, 140);
      doc.text('Autres informations :', 10, y);
      y += 7;
      doc.setFontSize(11);
      doc.setTextColor(0,0,0);
      const autres = doc.splitTextToSize(rapport.autres_infos, 185);
      doc.text(autres, 10, y);
      y += autres.length * 6 + 2;
    }
    
    // Historique (si chargé)
    if (Array.isArray(historiqueData) && historiqueData.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(0, 70, 140);
      doc.text('Historique :', 10, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      
      historiqueData.forEach((action, idx) => {
        if (y > 270) { 
          doc.addPage(); 
          y = 15; 
        }
        doc.text(`- [${formatDate(action.date_action)}] ${action.type_action} par ${getOperateurNom(action.id_operateur)} :`, 12, y);
        y += 5;
        const details = doc.splitTextToSize(action.detail_action || '', 180);
        doc.text(details, 14, y);
        y += details.length * 5 + 2;
      });
    }
    
    // Téléchargement du fichier PDF
    doc.save(`rapport_${rapport.id_rapport}.pdf`);
  };

  // =========================
  // LOGIQUE DE FILTRAGE ET RECHERCHE DES RAPPORTS
  // =========================
  
  /**
   * Applique tous les filtres et critères de recherche aux rapports
   * @desc Combine le filtrage par critères spécifiques et la recherche textuelle globale
   * @returns {Array} Tableau des rapports filtrés selon les critères actifs
   */
  const rapportsFiltres = rapports.filter(rapport => {
    // Filtrage par critères spécifiques (dropdowns et dates)
    const correspond = (
      (!filtres.type || rapport.id_type_evenement === Number(filtres.type)) &&
      (!filtres.sousType || rapport.id_sous_type_evenement === Number(filtres.sousType)) &&
      (!filtres.origine || rapport.id_origine_evenement === Number(filtres.origine)) &&
      (!filtres.zone || rapport.id_zone === Number(filtres.zone)) &&
      (!filtres.dateDebut || new Date(rapport.date_evenement) >= new Date(filtres.dateDebut)) &&
      (!filtres.dateFin || new Date(rapport.date_evenement) <= new Date(filtres.dateFin)) &&
      (filtres.archive === '' || rapport.archive === Number(filtres.archive))
    );
    
    // Recherche textuelle dans les champs principaux
    const rechercheTexte = searchTerm
      ? (
        rapport.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rapport.description_globale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTypeEvenementLibelle(rapport.id_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSousTypeEvenementLibelle(rapport.id_sous_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOrigineEvenementLibelle(rapport.id_origine_evenement).toLowerCase().includes(searchTerm.toLowerCase())
      )
      : true;
    
    // Combinaison des deux critères de filtrage
    return correspond && rechercheTexte;
  });

  // =========================
  // RENDU DU COMPOSANT PRINCIPAL
  // =========================
  
  /**
   * Rendu principal du composant avec animations Framer Motion
   * @desc Structure complète de l'interface utilisateur :
   * - Conteneur principal avec animation d'entrée
   * - Barre de recherche globale
   * - Panneau de filtres (collapsible)
   * - Tableau des rapports avec actions
   * - Modals pour détails, historique et gestion des accès
   */
  return (
    <motion.div
      className="liste-rapport-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* En-tête principal */}
      <h1>
        Liste des Rapports
      </h1>

      {/* Barre de recherche textuelle globale */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher un rapport..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button className="btn btn-primary search-btn">
          <i className="search-icon">🔍</i>
        </button>
      </div>

      {/* Panneau de filtres avancés */}
      <div>
        <Filtres
          filtres={filtres}
          handleFiltreChange={handleFiltreChange}
          toggleFiltres={toggleFiltres}
          filtresOuverts={filtresOuverts}
          reinitialiserFiltres={reinitialiserFiltres}
          filtreActif={filtreActif}
          typeEvenements={typeEvenements}
          sousTypeEvenements={sousTypeEvenements}
          origineEvenements={origineEvenements}
          zones={zones}
        />
      </div>

      {/* Tableau principal des rapports */}
      <div>
        <RapportsTable
          loading={loading}
          error={error}
          rapportsFiltres={rapportsFiltres}
          getTypeEvenementLibelle={getTypeEvenementLibelle}
          getSousTypeEvenementLibelle={getSousTypeEvenementLibelle}
          getOrigineEvenementLibelle={getOrigineEvenementLibelle}
          formatDate={formatDate}
          getOperateurNom={getOperateurNom}
          voirDetails={voirDetails}
          voirHistorique={voirHistorique}
          userPeutModifier={userPeutModifier}
          modifierRapport={modifierRapport}
          authData={authData}
          ouvrirGestionAcces={ouvrirGestionAcces}
        />
      </div>

      {/* Modal principale pour détails et historique */}
      <AnimatePresence>
        {rapportSelectionne && (
          <motion.div
            className="modal"
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="modal-content">
              {/* En-tête de la modal */}
              <div className="modal-header">
                <h2>
                  {afficherHistorique
                    ? "Historique du rapport"
                    : afficherAjoutHistorique
                      ? "Ajouter un historique"
                      : "Détails du rapport"}
                </h2>
                <button className="close-btn" onClick={fermerModal}>&times;</button>
              </div>
              
              {/* Contenu de la modal selon le mode */}
              <div className="modal-body">
                {rapportSelectionne && (
                  <>
                    {/* Mode affichage de l'historique */}
                    {afficherHistorique ? (
                      <div className="historique-rapport">
                        <h3>Historique des actions</h3>
                        {historiqueData ? (
                          historiqueData.length > 0 ? (
                            historiqueData.map((action, index) => (
                              <div
                                key={index}
                                className="historique-item"
                              >
                                <p><strong>Action:</strong> {action.type_action}</p>
                                <p><strong>Détails:</strong> {action.detail_action}</p>
                                <p><strong>Opérateur:</strong> {getOperateurNom(action.id_operateur)}</p>
                                <p><strong>Date:</strong> {formatDate(action.date_action)}</p>
                              </div>
                            ))
                          ) : (
                            <p>Aucun historique disponible.</p>
                          )
                        ) : (
                          <p>Chargement de l'historique...</p>
                        )}
                      </div>
                    ) : afficherAjoutHistorique ? (
                      /* Mode ajout d'historique manuel */
                      <div className="ajout-historique-form">
                        <h3>Ajouter un élément d'historique</h3>
                        <div className="form-group">
                          <label htmlFor="type_action">Type d'action:</label>
                          <input
                            type="text"
                            id="type_action"
                            name="type_action"
                            value={nouvelHistorique.type_action}
                            onChange={handleHistoriqueChange}
                            className="form-control"
                            placeholder="Ex: OBSERVATION, INTERVENTION, SUIVI..."
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="detail_action">Détails:</label>
                          <textarea
                            id="detail_action"
                            name="detail_action"
                            value={nouvelHistorique.detail_action}
                            onChange={handleHistoriqueChange}
                            className="form-control"
                            rows="4"
                            placeholder="Décrivez l'action ou l'observation en détail..."
                          ></textarea>
                        </div>
                      </div>
                    ) : (
                      /* Mode affichage des détails du rapport */
                      <DetailsRapport
                        rapportSelectionne={rapportSelectionne}
                        formatDate={formatDate}
                        getOperateurNom={getOperateurNom}
                        getTypeEvenementLibelle={getTypeEvenementLibelle}
                        getSousTypeEvenementLibelle={getSousTypeEvenementLibelle}
                        getOrigineEvenementLibelle={getOrigineEvenementLibelle}
                        getZoneNom={getZoneNom}
                        historique={historiqueData}
                      />
                    )}
                  </>
                )}
              </div>
              
              {/* Pied de la modal avec boutons d'action */}
              <div className="modal-footer">
                {/* Boutons pour le mode détails */}
                {rapportSelectionne && !afficherHistorique && !afficherAjoutHistorique && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={async () => {
                        setAfficherHistorique(true);
                        setAfficherAjoutHistorique(false);
                        setHistoriqueData(await fetchHistorique(rapportSelectionne.id_rapport));
                      }}
                    >
                      Voir l'historique
                    </button>
                    {/* Bouton PDF */}
                    <button
                      className="btn btn-info"
                      onClick={() => telechargerPDFRapport(rapportSelectionne)}
                      style={{ marginLeft: 8 }}
                    >
                      Télécharger le PDF
                    </button>
                  </>
                )}
                
                {/* Bouton d'ajout d'historique manuel (si autorisé) */}
                {rapportSelectionne && !afficherAjoutHistorique && userPeutModifier(rapportSelectionne) && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setAfficherHistorique(false);
                      setAfficherAjoutHistorique(true);
                    }}
                  >
                    Ajouter un historique manuel
                  </button>
                )}
                
                {/* Bouton de téléchargement de l'historique */}
                {rapportSelectionne && afficherHistorique && (
                  <button
                    className="btn-icon text-info"
                    onClick={() => telechargerHistorique(rapportSelectionne)}
                    title="Télécharger l'historique"
                  >
                    <Download size={18} />
                  </button>
                )}
                
                {/* Boutons pour le formulaire d'ajout d'historique */}
                {rapportSelectionne && afficherAjoutHistorique && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={ajouterHistoriqueManuel}
                    >
                      Enregistrer
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setAfficherAjoutHistorique(false);
                        setAfficherHistorique(false);
                      }}
                    >
                      Annuler
                    </button>
                  </>
                )}
                
                {/* Bouton de modification (si autorisé) */}
                {rapportSelectionne && userPeutModifier(rapportSelectionne) && !afficherAjoutHistorique && !afficherHistorique && (
                  <button
                    className="btn btn-primary"
                    onClick={() => modifierRapport(rapportSelectionne.id_rapport)}
                  >
                    Modifier
                  </button>
                )}
                
                {/* Bouton de fermeture */}
                <button className="btn btn-primary" onClick={fermerModal}>Fermer</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal pour la gestion des accès utilisateurs */}
      {afficherGestionAcces && (
        <GestionAccesModal
          accessModalRef={accessModalRef}
          rapportSelectionne={rapportSelectionne}
          operateurs={operateurs}
          operateursAvecAcces={operateursAvecAcces}
          nouvelOperateurAcces={nouvelOperateurAcces}
          handleNouvelOperateurChange={handleNouvelOperateurChange}
          ajouterAccesOperateur={ajouterAccesOperateur}
          retirerAccesOperateur={retirerAccesOperateur}
          fermerGestionAcces={fermerGestionAcces}
          afficherAjoutHistorique={afficherAjoutHistorique}
          afficherHistorique={afficherHistorique}
          setAfficherAjoutHistorique={setAfficherAjoutHistorique}
          setAfficherHistorique={setAfficherHistorique}
          nouvelHistorique={nouvelHistorique}
          handleHistoriqueChange={handleHistoriqueChange}
          ajouterHistoriqueManuel={ajouterHistoriqueManuel}
          fetchHistorique={fetchHistorique}
          setHistoriqueData={setHistoriqueData}
        />
      )}
    </motion.div>
  );
};

export default ListeRapport;
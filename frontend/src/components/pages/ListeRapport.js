import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/ListeRapport.css';
import {
  Download,        // Télécharger
} from 'lucide-react'


import Filtres from './ListeRapport/Filtres';
import RapportsTable from "./ListeRapport/RapportsTable";
import DetailsRapport from './ListeRapport/DetailsRapport';
import GestionAccesModal from './ListeRapport/GestionAccessModal';


const ListeRapport = () => {

  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeEvenements, setTypeEvenements] = useState([]);
  const [sousTypeEvenements, setSousTypeEvenements] = useState([]);
  const [origineEvenements, setOrigineEvenements] = useState([]);
  const [zones, setZones] = useState([]);
  const [operateurs, setOperateurs] = useState([]); // Liste des opérateurs pour l'attribution d'accès
  const [filtreActif, setFiltreActif] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({
    type: '',
    sousType: '',
    origine: '',
    zone: '',
    dateDebut: '',
    dateFin: '',
    archive: '0'
  });
  const [rapportSelectionne, setRapportSelectionne] = useState(null);
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  const [afficherGestionAcces, setAfficherGestionAcces] = useState(false);
  const [operateursAvecAcces, setOperateursAvecAcces] = useState([]);
  const [nouvelOperateurAcces, setNouvelOperateurAcces] = useState('');
  const [historiqueData, setHistoriqueData] = useState(null);
  // Ajout d'un état pour stocker les droits d'accès
  const [droitsAcces, setDroitsAcces] = useState({});
  //new
  const [afficherAjoutHistorique, setAfficherAjoutHistorique] = useState(false);
  const [nouvelHistorique, setNouvelHistorique] = useState({
    type_action: '',
    detail_action: ''
  });

  const { authData } = useAuth();

  const modalRef = useRef(null);
  const accessModalRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Fonction pour charger tous les rapports
  const fetchRapports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/rapports`);
      setRapports(response.data);

      // Charger les droits d'accès pour tous les rapports
      await fetchDroitsAcces();
    } catch (err) {
      console.error("Erreur lors de la récupération des rapports:", err);
      setError("Une erreur est survenue lors du chargement des rapports.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async (idRapport) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rapports/historique/${idRapport}`);
      return response.data;
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err);
      setError("Une erreur est survenue lors du chargement de l'historique.");
      return []; // Retourner un tableau vide en cas d'erreur
    }
  };

  // Nouvelle fonction pour charger les droits d'accès
  const fetchDroitsAcces = async () => {
    try {
      // Récupérer tous les droits d'accès (ou filtrer par utilisateur si nécessaire)
      const response = await axios.get(`${API_BASE_URL}/rapports/acces/all`);

      // Organiser les droits d'accès par rapport
      const droits = {};
      response.data.forEach(droit => {
        if (!droits[droit.id_rapport]) {
          droits[droit.id_rapport] = [];
        }
        droits[droit.id_rapport].push(droit.id_operateur);
      });

      setDroitsAcces(droits);
    } catch (err) {
      console.error("Erreur lors de la récupération des droits d'accès:", err);
    }
  };

  const telechargerHistorique = async (rapport) => {
    try {
      // Charger l'historique du rapport
      const historique = await fetchHistorique(rapport.id_rapport);

      if (historique && historique.length > 0) {
        // Définir l'en-tête du fichier texte
        let txtContent = "Type d'action       | Détails                             | Opérateur         | Date\n";
        txtContent += "--------------------|-------------------------------------|-------------------|---------------------\n";

        historique.forEach(action => {
          const operateurNom = getOperateurNom(action.id_operateur);
          const dateFormatee = formatDate(action.date_action);
          const detailAction = action.detail_action
            ? action.detail_action.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
            : "";

          // Ajuster les longueurs pour aligner le tout (padding à droite)
          const typeAction = action.type_action.padEnd(20);
          const details = detailAction.slice(0, 35).padEnd(35);
          const operateur = operateurNom.padEnd(19);
          const date = dateFormatee.padEnd(20);

          txtContent += `${typeAction}| ${details}| ${operateur}| ${date}\n`;
        });

        // Créer un objet Blob avec le contenu texte
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Créer un lien pour télécharger le fichier
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `historique_rapport_${rapport.id_rapport}.txt`);
        link.style.visibility = 'hidden';

        // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libérer l'URL
        URL.revokeObjectURL(url);
      } else {
        alert("Aucun historique disponible pour ce rapport.");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'historique :", error);
      alert("Une erreur est survenue lors du téléchargement de l'historique.");
    }
  };








  //new 558
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  // Fonction pour basculer l'état des filtres
  const toggleFiltres = () => {
    setFiltresOuverts(prevState => !prevState);
  };


  // Charger les données au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer tous les rapports
        const rapportsResponse = await axios.get(`${API_BASE_URL}/rapports`);

        // Récupérer les données pour les filtres
        const typeEvenementsResponse = await axios.get(`${API_BASE_URL}/rapports/type-evenement`);
        const sousTypeEvenementsResponse = await axios.get(`${API_BASE_URL}/rapports/sous-type-pollution`);
        const origineEvenementsResponse = await axios.get(`${API_BASE_URL}/rapports/origine-evenement`);
        const zonesResponse = await axios.get(`${API_BASE_URL}/rapports/zone-geographique`);
        const operateursResponse = await axios.get(`${API_BASE_URL}/rapports/operateurs`);

        setRapports(rapportsResponse.data);
        setTypeEvenements(typeEvenementsResponse.data);
        setSousTypeEvenements(sousTypeEvenementsResponse.data);
        setOrigineEvenements(origineEvenementsResponse.data);
        setZones(zonesResponse.data);
        setOperateurs(operateursResponse.data);

        // Charger les droits d'accès
        await fetchDroitsAcces();
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonctions utilitaires pour obtenir les libellés
  const getTypeEvenementLibelle = (id) => {
    const type = typeEvenements.find(t => t.id_type_evenement === id);
    return type ? type.libelle : 'Non défini';
  };

  const getSousTypeEvenementLibelle = (id) => {
    const sousType = sousTypeEvenements.find(st => st.id_sous_type_evenement === id);
    return sousType ? sousType.libelle : 'Non défini';
  };

  const getOrigineEvenementLibelle = (id) => {
    const origine = origineEvenements.find(o => o.id_origine_evenement === id);
    return origine ? origine.libelle : 'Non défini';
  };

  const getZoneNom = (id) => {
    const zone = zones.find(z => z.id_zone === id);
    return zone ? zone.nom_zone : 'Non définie';
  };

  const getOperateurNom = (id) => {
    const operateur = operateurs.find(o => o.id_operateur === id);
    return operateur ? `${operateur.prenom} ${operateur.nom}` : `Opérateur ID ${id}`;
  };

  // Vérifier si l'utilisateur actuel a accès à la modification d'un rapport
  const userPeutModifier = (rapport) => {
    if (!authData || !rapport) return false;

    const userId = authData.Opid;

    // Vérifie si l'utilisateur est le créateur
    if (rapport.id_operateur === userId) {
      return true;
    }

    // Vérifie s'il a reçu un accès dans acces_rapport
    const operateursAvecAcces = droitsAcces[rapport.id_rapport] || [];
    return operateursAvecAcces.includes(userId);
  };


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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({ ...prev, [name]: value }));
  };

  const handleHistoriqueChange = (e) => {
    const { name, value } = e.target;
    setNouvelHistorique(prev => ({ ...prev, [name]: value }));
  };



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

    // Recharger tous les rapports
    await fetchRapports();
  };

  const voirDetails = async (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(false);
    setAfficherGestionAcces(false);

    // Charger l'historique du rapport sélectionné
    const historique = await fetchHistorique(rapport.id_rapport);
    setHistoriqueData(historique);

    // Ouvrir la modal
    if (modalRef.current) {
      modalRef.current.classList.add('active');
    }
  };

  // Modifier la fonction voirHistorique pour charger immédiatement l'historique
  const voirHistorique = async (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(true);
    setAfficherGestionAcces(false);

    try {
      // Charger l'historique dès qu'on clique sur le bouton
      const historique = await fetchHistorique(rapport.id_rapport);
      setHistoriqueData(historique);
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique:", err);
    }

    // Ouvrir la modal
    if (modalRef.current) {
      modalRef.current.classList.add('active');
    }
  };

  const fermerModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('active');
    }
  };

  // Nouvelles fonctions pour la gestion des accès
  const ouvrirGestionAcces = async (rapport) => {
    setRapportSelectionne(rapport);

    try {
      // Récupérer la liste des opérateurs ayant accès au rapport
      const response = await axios.get(`${API_BASE_URL}/rapports/${rapport.id_rapport}/acces`);
      setOperateursAvecAcces(response.data);

      setAfficherGestionAcces(true);

      // Ouvrir la modal
      if (accessModalRef.current) {
        accessModalRef.current.classList.add('active');
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des accès:", err);
      setError("Une erreur est survenue lors du chargement des accès.");
    }
  };

  const fermerGestionAcces = () => {
    if (accessModalRef.current) {
      accessModalRef.current.classList.remove('active');
    }
    setNouvelOperateurAcces('');
  };

  const handleNouvelOperateurChange = (e) => {
    setNouvelOperateurAcces(e.target.value);
  };

  const ajouterAccesOperateur = async () => {
    if (!nouvelOperateurAcces || !rapportSelectionne) return;

    try {
      await axios.post(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`, {
        id_operateur: nouvelOperateurAcces,
        peut_modifier: true  // Définir à true pour permettre la modification
      });

      // Ajouter une entrée dans l'historique
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: nouvelOperateurAcces,
        type_action: 'AJOUT_D_ACCES',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: ''
      });


      // Rafraîchir la liste des opérateurs avec accès
      const response = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(response.data);

      // Mettre à jour les droits d'accès globaux
      await fetchDroitsAcces();

      setNouvelOperateurAcces('');
    } catch (err) {
      console.error("Erreur lors de l'ajout d'accès:", err);
      setError("Une erreur est survenue lors de l'ajout d'accès.");
    }
  };

  const ajouterHistoriqueManuel = async () => {
    try {
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: authData.Opid,
        type_action: nouvelHistorique.type_action,
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: nouvelHistorique.detail_action
      });

      // Recharger l'historique après l'ajout
      const historique = await fetchHistorique(rapportSelectionne.id_rapport);
      setHistoriqueData(historique);

      // Réinitialiser le formulaire
      setNouvelHistorique({
        type_action: '',
        detail_action: ''
      });

      // Revenir à l'affichage de l'historique
      setAfficherAjoutHistorique(false);
      setAfficherHistorique(true);
    } catch (err) {
      console.error("Erreur lors de l'ajout d'un historique manuel:", err);
      setError("Une erreur est survenue lors de l'ajout d'un historique manuel.");
    }
  };

  const retirerAccesOperateur = async (idOperateur) => {
    try {
      await axios.delete(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces/${idOperateur}`);

      // Rafraîchir la liste des opérateurs avec accès
      const response = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(response.data);

      // Ajouter une entrée dans l'historique
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: idOperateur,
        type_action: 'RETRAIT_D_ACCES',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: ''
      });


      // Mettre à jour les droits d'accès globaux
      await fetchDroitsAcces();
    } catch (err) {
      console.error("Erreur lors du retrait d'accès:", err);
      setError("Une erreur est survenue lors du retrait d'accès.");
    }
  };

  // Rediriger vers la page de modification du rapport
  const modifierRapport = (idRapport) => {
    window.location.href = `/modifier-rapport/${idRapport}`;
  };

  // Filtrer les rapports en fonction du terme de recherche
  const rapportsFiltres = rapports.filter(rapport => {
    const correspond = (
      (!filtres.type || rapport.id_type_evenement === filtres.type) &&
      (!filtres.sousType || rapport.id_sous_type_evenement === filtres.sousType) &&
      (!filtres.origine || rapport.id_origine_evenement === filtres.origine) &&
      (!filtres.zone || rapport.id_zone === filtres.zone) &&
      (!filtres.dateDebut || new Date(rapport.date_evenement) >= new Date(filtres.dateDebut)) &&
      (!filtres.dateFin || new Date(rapport.date_evenement) <= new Date(filtres.dateFin)) &&
      (!filtres.archive || rapport.archive == filtres.archive)
    );

    const rechercheTexte = searchTerm
      ? (
        rapport.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rapport.description_globale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTypeEvenementLibelle(rapport.id_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSousTypeEvenementLibelle(rapport.id_sous_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getOrigineEvenementLibelle(rapport.id_origine_evenement).toLowerCase().includes(searchTerm.toLowerCase())
      )
      : true;

    return correspond && rechercheTexte;
  });




  return (
    <div className="liste-rapport-container">
      <h1>Liste des Rapports</h1>

      {/* Barre de recherche */}
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

      {/* Filtres */}
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

      {/* Liste des rapports */}
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

      {/* Modal pour détails et historique */}
      <div className="modal" ref={modalRef}>
        <div className="modal-content">
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
          <div className="modal-body">
            {rapportSelectionne && (
              <>
                {afficherHistorique ? (
                  <div className="historique-rapport">
                    <h3>Historique des actions</h3>
                    {historiqueData ? (
                      historiqueData.length > 0 ? (
                        historiqueData.map((action, index) => (
                          <div key={index} className="historique-item">
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
                  <DetailsRapport
                    rapportSelectionne={rapportSelectionne}
                    formatDate={formatDate}
                    getOperateurNom={getOperateurNom}
                    getTypeEvenementLibelle={getTypeEvenementLibelle}
                    getSousTypeEvenementLibelle={getSousTypeEvenementLibelle}
                    getOrigineEvenementLibelle={getOrigineEvenementLibelle}
                    getZoneNom={getZoneNom}
                    historique={historiqueData} // <-- Ajout ici
                  />
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            {rapportSelectionne && !afficherHistorique && !afficherAjoutHistorique && (
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  setAfficherHistorique(true);
                  setAfficherAjoutHistorique(false);
                  const historique = await fetchHistorique(rapportSelectionne.id_rapport);
                  setHistoriqueData(historique);
                }}
              >
                Voir l'historique
              </button>
            )}
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
            {rapportSelectionne && afficherHistorique && (
              <button
                className="btn-icon text-info"
                onClick={() => telechargerHistorique(rapportSelectionne)}
                title="Télécharger l'historique"
              >
                <Download size={18} />
              </button>
            )}
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
            {rapportSelectionne && userPeutModifier(rapportSelectionne) && !afficherAjoutHistorique && !afficherHistorique && (
              <button
                className="btn btn-primary"
                onClick={() => modifierRapport(rapportSelectionne.id_rapport)}
              >
                Modifier
              </button>
            )}
            <button className="btn btn-primary" onClick={fermerModal}>Fermer</button>
          </div>
        </div>
      </div>

      {/* Modal pour la gestion des accès */}
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
    </div>
  );
};

export default ListeRapport;
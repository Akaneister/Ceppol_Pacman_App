import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/ListeRapport.css';
import { Download } from 'lucide-react';

import Filtres from './ListeRapport/Filtres';
import RapportsTable from "./ListeRapport/RapportsTable";
import DetailsRapport from './ListeRapport/DetailsRapport';
import GestionAccesModal from './ListeRapport/GestionAccessModal';

/**
 * Composant principal pour la gestion et l'affichage des rapports.
 * Permet la recherche, le filtrage, la gestion des accès et l'historique.
 */
const ListeRapport = () => {
  // =========================
  // States principaux
  // =========================
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Données pour les filtres
  const [typeEvenements, setTypeEvenements] = useState([]);
  const [sousTypeEvenements, setSousTypeEvenements] = useState([]);
  const [origineEvenements, setOrigineEvenements] = useState([]);
  const [zones, setZones] = useState([]);
  const [operateurs, setOperateurs] = useState([]);

  // Filtres et recherche
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

  // Sélection et affichage
  const [rapportSelectionne, setRapportSelectionne] = useState(null);
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  const [afficherAjoutHistorique, setAfficherAjoutHistorique] = useState(false);
  const [afficherGestionAcces, setAfficherGestionAcces] = useState(false);

  // Gestion des accès
  const [operateursAvecAcces, setOperateursAvecAcces] = useState([]);
  const [nouvelOperateurAcces, setNouvelOperateurAcces] = useState('');
  const [droitsAcces, setDroitsAcces] = useState({});

  // Historique
  const [historiqueData, setHistoriqueData] = useState(null);
  const [nouvelHistorique, setNouvelHistorique] = useState({
    type_action: '',
    detail_action: ''
  });

  // UI
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  // Authentification
  const { authData } = useAuth();

  // Références pour les modals
  const modalRef = useRef(null);
  const accessModalRef = useRef(null);

  // Base URL API
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // =========================
  // Effets de chargement initial
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupération des données principales
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
        setRapports(rapportsRes.data);
        setTypeEvenements(typeEvRes.data);
        setSousTypeEvenements(sousTypeEvRes.data);
        setOrigineEvenements(origineEvRes.data);
        setZones(zonesRes.data);
        setOperateurs(operateursRes.data);

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

  // =========================
  // Fonctions utilitaires
  // =========================

  // Récupère le libellé d'un type d'événement
  const getTypeEvenementLibelle = (id) =>
    typeEvenements.find(t => t.id_type_evenement === id)?.libelle || 'Non défini';

  // Récupère le libellé d'un sous-type d'événement
  const getSousTypeEvenementLibelle = (id) =>
    sousTypeEvenements.find(st => st.id_sous_type_evenement === id)?.libelle || 'Non défini';

  // Récupère le libellé d'une origine d'événement
  const getOrigineEvenementLibelle = (id) =>
    origineEvenements.find(o => o.id_origine_evenement === id)?.libelle || 'Non défini';

  // Récupère le nom d'une zone
  const getZoneNom = (id) =>
    zones.find(z => z.id_zone === id)?.nom_zone || 'Non définie';

  // Récupère le nom complet d'un opérateur
  const getOperateurNom = (id) => {
    const op = operateurs.find(o => o.id_operateur === id);
    return op ? `${op.prenom} ${op.nom}` : `Opérateur ID ${id}`;
  };

  // Formate une date en français
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

  // Vérifie si l'utilisateur courant peut modifier le rapport
  const userPeutModifier = (rapport) => {
    if (!authData || !rapport) return false;
    const userId = authData.Opid;
    if (rapport.id_operateur === userId) return true;
    const acces = droitsAcces[rapport.id_rapport] || [];
    return acces.includes(userId);
  };

  // =========================
  // Fonctions de gestion API
  // =========================

  // Récupère tous les droits d'accès
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

  // Récupère l'historique d'un rapport
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

  // Récupère tous les rapports (utile pour réinitialiser)
  const fetchRapports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/rapports`);
      setRapports(res.data);
      await fetchDroitsAcces();
    } catch (err) {
      console.error("Erreur lors de la récupération des rapports:", err);
      setError("Une erreur est survenue lors du chargement des rapports.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Handlers UI et actions
  // =========================

  // Gestion de la recherche
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Gestion des filtres
  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({ ...prev, [name]: value }));
  };

  // Réinitialise tous les filtres
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

  // Bascule l'affichage des filtres
  const toggleFiltres = () => setFiltresOuverts(prev => !prev);

  // Gestion du formulaire d'ajout d'historique
  const handleHistoriqueChange = (e) => {
    const { name, value } = e.target;
    setNouvelHistorique(prev => ({ ...prev, [name]: value }));
  };

  // Ouvre la modal de détails d'un rapport
  const voirDetails = async (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(false);
    setAfficherGestionAcces(false);
    setHistoriqueData(await fetchHistorique(rapport.id_rapport));
    modalRef.current?.classList.add('active');
  };

  // Ouvre la modal d'historique d'un rapport
  const voirHistorique = async (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(true);
    setAfficherGestionAcces(false);
    setHistoriqueData(await fetchHistorique(rapport.id_rapport));
    modalRef.current?.classList.add('active');
  };

  // Ferme la modal principale
  const fermerModal = () => modalRef.current?.classList.remove('active');

  // Ouvre la modal de gestion des accès
  const ouvrirGestionAcces = async (rapport) => {
    setRapportSelectionne(rapport);
    try {
      const res = await axios.get(`${API_BASE_URL}/rapports/${rapport.id_rapport}/acces`);
      setOperateursAvecAcces(res.data);
      setAfficherGestionAcces(true);
      accessModalRef.current?.classList.add('active');
    } catch (err) {
      console.error("Erreur lors de la récupération des accès:", err);
      setError("Une erreur est survenue lors du chargement des accès.");
    }
  };

  // Ferme la modal de gestion des accès
  const fermerGestionAcces = () => {
    accessModalRef.current?.classList.remove('active');
    setNouvelOperateurAcces('');
  };

  // Gestion du champ opérateur à ajouter
  const handleNouvelOperateurChange = (e) => setNouvelOperateurAcces(e.target.value);

  // Ajoute un accès opérateur à un rapport
  const ajouterAccesOperateur = async () => {
    if (!nouvelOperateurAcces || !rapportSelectionne) return;
    try {
      await axios.post(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`, {
        id_operateur: nouvelOperateurAcces,
        peut_modifier: true
      });
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: nouvelOperateurAcces,
        type_action: 'AJOUT_D_ACCES',
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: ''
      });
      const res = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(res.data);
      await fetchDroitsAcces();
      setNouvelOperateurAcces('');
    } catch (err) {
      console.error("Erreur lors de l'ajout d'accès:", err);
      setError("Une erreur est survenue lors de l'ajout d'accès.");
    }
  };

  // Retire un accès opérateur d'un rapport
  const retirerAccesOperateur = async (idOperateur) => {
    try {
      await axios.delete(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces/${idOperateur}`);
      const res = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(res.data);
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

  // Ajoute un historique manuel à un rapport
  const ajouterHistoriqueManuel = async () => {
    try {
      await axios.post(`${API_BASE_URL}/rapports/historique`, {
        id_rapport: rapportSelectionne.id_rapport,
        id_operateur: authData.Opid,
        type_action: nouvelHistorique.type_action,
        date_action: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        detail_action: nouvelHistorique.detail_action
      });
      setHistoriqueData(await fetchHistorique(rapportSelectionne.id_rapport));
      setNouvelHistorique({ type_action: '', detail_action: '' });
      setAfficherAjoutHistorique(false);
      setAfficherHistorique(true);
    } catch (err) {
      console.error("Erreur lors de l'ajout d'un historique manuel:", err);
      setError("Une erreur est survenue lors de l'ajout d'un historique manuel.");
    }
  };

  // Redirige vers la page de modification du rapport
  const modifierRapport = (idRapport) => {
    window.location.href = `/modifier-rapport/${idRapport}`;
  };

  // Télécharge l'historique d'un rapport au format texte
  const telechargerHistorique = async (rapport) => {
    try {
      const historique = await fetchHistorique(rapport.id_rapport);
      if (historique && historique.length > 0) {
        let txtContent = "Type d'action       | Détails                             | Opérateur         | Date\n";
        txtContent += "--------------------|-------------------------------------|-------------------|---------------------\n";
        historique.forEach(action => {
          const operateurNom = getOperateurNom(action.id_operateur);
          const dateFormatee = formatDate(action.date_action);
          const detailAction = action.detail_action
            ? action.detail_action.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
            : "";
          const typeAction = action.type_action.padEnd(20);
          const details = detailAction.slice(0, 35).padEnd(35);
          const operateur = operateurNom.padEnd(19);
          const date = dateFormatee.padEnd(20);
          txtContent += `${typeAction}| ${details}| ${operateur}| ${date}\n`;
        });
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

  // =========================
  // Filtrage des rapports
  // =========================
  const rapportsFiltres = rapports.filter(rapport => {
    const correspond = (
      (!filtres.type || rapport.id_type_evenement === Number(filtres.type)) &&
      (!filtres.sousType || rapport.id_sous_type_evenement === Number(filtres.sousType)) &&
      (!filtres.origine || rapport.id_origine_evenement === Number(filtres.origine)) &&
      (!filtres.zone || rapport.id_zone === Number(filtres.zone)) &&
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

  // =========================
  // Rendu du composant
  // =========================
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
                    historique={historiqueData}
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
                  setHistoriqueData(await fetchHistorique(rapportSelectionne.id_rapport));
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
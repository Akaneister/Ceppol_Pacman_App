import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../css/ListeRapport.css';


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
    dateFin: ''
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

    // Vérifier si l'utilisateur est le créateur du rapport
    if (rapport.id_operateur === userId) {
      return true;
    }
    

    // Vérifier si l'utilisateur a des droits d'accès sur ce rapport
    const operateursAvecAccesAuRapport = droitsAcces[rapport.id_rapport] || [];

    return operateursAvecAccesAuRapport.includes(rapport.id_operateur);
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

  const appliquerFiltres = async () => {
    try {
      setLoading(true);
      setFiltreActif(true);

      // Construire les paramètres de requête à partir des filtres
      const params = new URLSearchParams();

      if (filtres.type) params.append('id_type_evenement', filtres.type);
      if (filtres.sousType) params.append('id_sous_type_evenement', filtres.sousType);
      if (filtres.origine) params.append('id_origine_evenement', filtres.origine);
      if (filtres.zone) params.append('id_zone', filtres.zone);
      if (filtres.dateDebut) params.append('date_debut', filtres.dateDebut);
      if (filtres.dateFin) params.append('date_fin', filtres.dateFin);
      if (filtres.archiver) params.append('archiver', filtres.archiver);

      // Appel à l'API avec les filtres
      const response = await axios.get(`${API_BASE_URL}/rapports?${params}`);
      setRapports(response.data);

      // Charger les droits d'accès
      await fetchDroitsAcces();
    } catch (err) {
      console.error("Erreur lors de l'application des filtres:", err);
      setError("Une erreur est survenue lors de l'application des filtres.");
    } finally {
      setLoading(false);
    }
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

  const voirDetails = (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(false);
    setAfficherGestionAcces(false);

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
  const rapportsFiltres = searchTerm
  ? rapports.filter(rapport =>
      rapport.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.description_globale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeEvenementLibelle(rapport.id_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSousTypeEvenementLibelle(rapport.id_sous_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOrigineEvenementLibelle(rapport.id_origine_evenement).toLowerCase().includes(searchTerm.toLowerCase())
    )
  : rapports;



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
      <div className="filtres-section">
        <h2>Filtres</h2>
        <div className="filtres-grid">
          <div className="filtre-groupe">
            <label htmlFor="type">Type d'événement:</label>
            <select name="type" id="type" value={filtres.type} onChange={handleFiltreChange}>
              <option value="">Tous</option>
              {typeEvenements.map(type => (
                <option key={type.id_type_evenement} value={type.id_type_evenement}>
                  {type.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="filtre-groupe">
            <label htmlFor="sousType">Sous-type:</label>
            <select name="sousType" id="sousType" value={filtres.sousType} onChange={handleFiltreChange}>
              <option value="">Tous</option>
              {sousTypeEvenements
                .filter(st => !filtres.type || st.id_type_evenement === parseInt(filtres.type))
                .map(sousType => (
                  <option key={sousType.id_sous_type_evenement} value={sousType.id_sous_type_evenement}>
                    {sousType.libelle}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="filtre-groupe">
            <label htmlFor="origine">Origine:</label>
            <select name="origine" id="origine" value={filtres.origine} onChange={handleFiltreChange}>
              <option value="">Toutes</option>
              {origineEvenements.map(origine => (
                <option key={origine.id_origine_evenement} value={origine.id_origine_evenement}>
                  {origine.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="filtre-groupe">
            <label htmlFor="zone">Zone:</label>
            <select name="zone" id="zone" value={filtres.zone} onChange={handleFiltreChange}>
              <option value="">Toutes</option>
              {zones.map(zone => (
                <option key={zone.id_zone} value={zone.id_zone}>
                  {zone.nom_zone}
                </option>
              ))}
            </select>
          </div>

          <div className="filtre-groupe">
            <label htmlFor="dateDebut">Date début:</label>
            <input
              type="date"
              name="dateDebut"
              id="dateDebut"
              value={filtres.dateDebut}
              onChange={handleFiltreChange}
            />
          </div>

          <div className="filtre-groupe">
            <label htmlFor="dateFin">Date fin:</label>
            <input
              type="date"
              name="dateFin"
              id="dateFin"
              value={filtres.dateFin}
              onChange={handleFiltreChange}
            />
          </div>


          
          <div className="filtre-groupe">
            <label htmlFor="archiver">Archiver:</label>
            <select name="archiver" id="archiver" value={filtres.archiver} onChange={handleFiltreChange}>
              <option value="">Tous</option>
              <option value="1">Oui</option>
              <option value="0">Non</option>
            </select>
          </div>
        </div>

        <div className="filtres-actions">
          <button className="btn btn-primary" onClick={appliquerFiltres}>
            Appliquer les filtres
          </button>
          <button className="btn btn-secondary" onClick={reinitialiserFiltres}>
            Réinitialiser
          </button>
        </div>

        {filtreActif && <div className="filtres-actifs">Filtres appliqués</div>}
      </div>

      {/* Liste des rapports */}
      <div className="rapports-container">
        {loading ? (
          <div className="loading">Chargement des rapports...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : rapportsFiltres.length === 0 ? (
          <div className="no-data">Aucun rapport trouvé</div>
        ) : (
          <table className="rapports-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Sous-type</th>
                <th>Origine</th>
                <th>Date de l'événement</th>
                <th>Opérateur</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rapportsFiltres.map(rapport => (
                <tr key={rapport.id_rapport}>
                  <td>{rapport.titre}</td>
                  <td>{getTypeEvenementLibelle(rapport.id_type_evenement)}</td>
                  <td>{getSousTypeEvenementLibelle(rapport.id_sous_type_evenement)}</td>
                  <td>{getOrigineEvenementLibelle(rapport.id_origine_evenement)}</td>
                  <td>{formatDate(rapport.date_evenement)}</td>
                  <td>{getOperateurNom(rapport.id_operateur)}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => voirDetails(rapport)}
                    >
                      Détails
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => voirHistorique(rapport)}
                    >
                      Historique
                    </button>
                    {userPeutModifier(rapport) && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => modifierRapport(rapport.id_rapport)}
                        >
                          Modifier
                        </button>
                      </>
                    )}
                    {authData && rapport.id_operateur === authData.Opid && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => ouvrirGestionAcces(rapport)}
                      >
                        Gérer accès
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  <div className="details-rapport">
                    {/* Garder tout le contenu existant des détails du rapport */}
                    <div className="rapport-header">
                      <h3>{rapportSelectionne.titre}</h3>
                      <span className="rapport-id">ID: {rapportSelectionne.id_rapport}</span>
                    </div>

                    <div className="rapport-sections">
                      <div className="rapport-section infos-principales">
                        <h4>Informations principales</h4>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Date de l'événement:</span>
                            <span className="info-value">{formatDate(rapportSelectionne.date_evenement)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Type:</span>
                            <span className="info-value info-tag type">{getTypeEvenementLibelle(rapportSelectionne.id_type_evenement)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Sous-type:</span>
                            <span className="info-value info-tag sous-type">{getSousTypeEvenementLibelle(rapportSelectionne.id_sous_type_evenement)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Origine:</span>
                            <span className="info-value info-tag origine">{getOrigineEvenementLibelle(rapportSelectionne.id_origine_evenement)}</span>
                          </div>
                          {rapportSelectionne.id_zone && (
                            <div className="info-item">
                              <span className="info-label">Zone géographique:</span>
                              <span className="info-value info-tag zone">{getZoneNom(rapportSelectionne.id_zone)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rapport-section description">
                        <h4>Description globale</h4>
                        <div className="description-content">
                          {rapportSelectionne.description_globale}
                        </div>
                      </div>
                      //

                      <div className="rapport-section responsable">
                        <h4>Responsable</h4>
                        <div className="responsable-info">
                          <div className="avatar">
                            {getOperateurNom(rapportSelectionne.id_operateur).substring(0, 1).toUpperCase()}
                          </div>
                          <div className="responsable-details">
                            <div className="responsable-nom">{getOperateurNom(rapportSelectionne.id_operateur)}</div>
                            <div className="responsable-date">Créé le {formatDate(rapportSelectionne.date_creation)}</div>
                          </div>
                        </div>
                      </div>

                      {rapportSelectionne.operateurs_acces && rapportSelectionne.operateurs_acces.length > 0 && (
                        <div className="rapport-section acces">
                          <h4>Accès partagés</h4>
                          <div className="acces-liste">
                            {rapportSelectionne.operateurs_acces.map(opId => (
                              <div key={opId} className="acces-item">
                                <span className="acces-avatar">{getOperateurNom(opId).substring(0, 1).toUpperCase()}</span>
                                <span className="acces-nom">{getOperateurNom(opId)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {rapportSelectionne.latitude && rapportSelectionne.longitude && (
                        <div className="rapport-section coords">
                          <h4>Coordonnées géographiques</h4>
                          <div className="coords-info">
                            <div className="coord-item">
                              <span className="coord-label">Latitude:</span>
                              <span className="coord-value">{rapportSelectionne.latitude}</span>
                            </div>
                            <div className="coord-item">
                              <span className="coord-label">Longitude:</span>
                              <span className="coord-value">{rapportSelectionne.longitude}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {rapportSelectionne.informations_supplementaires && (
                        <div className="rapport-section infos-supp">
                          <h4>Informations supplémentaires</h4>
                          <div className="infos-supp-content">
                            {rapportSelectionne.informations_supplementaires}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                  className="btn btn-info"
                  onClick={() => {
                  setAfficherHistorique(false);
                  setAfficherAjoutHistorique(false);
                }}
              >
                Voir les détails
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
      <div className="modal" ref={accessModalRef}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Gestion des accès au rapport</h2>
            <button className="close-btn" onClick={fermerGestionAcces}>&times;</button>
          </div>
          <div className="modal-body">
            {rapportSelectionne && (
              <div>
                <h3>Rapport: {rapportSelectionne.titre}</h3>
                <div className="acces-form">
                  <label htmlFor="nouvelOperateur">Ajouter un opérateur:</label>
                  <div className="acces-form-row">
                    <select
                      id="nouvelOperateur"
                      value={nouvelOperateurAcces}
                      onChange={handleNouvelOperateurChange}
                      className="select-operateur"
                    >
                      <option value="">Sélectionner un opérateur</option>
                      {operateurs
                        .filter(op =>
                          op.id_operateur !== rapportSelectionne.id_operateur &&
                          !operateursAvecAcces.some(acc => acc.id_operateur === op.id_operateur)
                        )
                        .map(op => (
                          <option key={op.id_operateur} value={op.id_operateur}>
                            {op.prenom} {op.nom}
                          </option>
                        ))
                      }
                    </select>
                    <button
                      className="btn btn-primary"
                      onClick={ajouterAccesOperateur}
                      disabled={!nouvelOperateurAcces}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                <div className="operateurs-acces-liste">
                  <h3>Opérateurs ayant accès</h3>
                  {operateursAvecAcces.length === 0 ? (
                    <p>Aucun opérateur supplémentaire n'a accès à ce rapport.</p>
                  ) : (
                    <table className="acces-table">
                      <thead>
                        <tr>
                          <th>Opérateur</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operateursAvecAcces
                          .filter(op => op.id_operateur !== rapportSelectionne.id_operateur) // Filtrer l'utilisateur connecté
                          .map(op => (
                            <tr key={op.id_operateur}>
                              <td>{op.prenom} {op.nom}</td>
                              <td>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => retirerAccesOperateur(op.id_operateur)}
                                >
                                  Retirer
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}


            {rapportSelectionne && afficherAjoutHistorique && (
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
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={ajouterHistoriqueManuel}>
                    Enregistrer
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setAfficherAjoutHistorique(false);
                      setAfficherHistorique(true);
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={fermerGestionAcces}>Fermer</button>
            {rapportSelectionne && !afficherHistorique && !afficherAjoutHistorique && (
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  setAfficherHistorique(true);
                  const historique = await fetchHistorique(rapportSelectionne.id_rapport);
                  setHistoriqueData(historique);
                }}
              >
                Voir l'historique
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeRapport;
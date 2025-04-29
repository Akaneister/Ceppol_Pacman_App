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
  // Ajout d'un état pour stocker les droits d'accès
  const [droitsAcces, setDroitsAcces] = useState({});

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
    
    return operateursAvecAccesAuRapport.includes(userId);
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

  const voirHistorique = (rapport) => {
    setRapportSelectionne(rapport);
    setAfficherHistorique(true);
    setAfficherGestionAcces(false);

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
  

  const retirerAccesOperateur = async (idOperateur) => {
    try {
      await axios.delete(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces/${idOperateur}`);

      // Rafraîchir la liste des opérateurs avec accès
      const response = await axios.get(`${API_BASE_URL}/rapports/${rapportSelectionne.id_rapport}/acces`);
      setOperateursAvecAcces(response.data);
      
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
    return rapport.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.description_globale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeEvenementLibelle(rapport.id_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSousTypeEvenementLibelle(rapport.id_sous_type_evenement).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOrigineEvenementLibelle(rapport.id_origine_evenement).toLowerCase().includes(searchTerm.toLowerCase());
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
            <h2>{afficherHistorique ? "Historique du rapport" : "Détails du rapport"}</h2>
            <button className="close-btn" onClick={fermerModal}>&times;</button>
          </div>
          <div className="modal-body">
            {rapportSelectionne && (
              afficherHistorique ? (
                <div className="historique-rapport">
                  <div className="historique-item">
                    <p><strong>Création:</strong> {formatDate(rapportSelectionne.date_creation)}</p>
                    <p><strong>Par:</strong> {getOperateurNom(rapportSelectionne.id_operateur)}</p>
                  </div>
                  <div className="historique-item">
                    <p><strong>Dernière modification:</strong> {formatDate(rapportSelectionne.date_modification)}</p>
                    <p><strong>Par:</strong> {getOperateurNom(rapportSelectionne.id_operateur_modification || rapportSelectionne.id_operateur)}</p>
                  </div>
                </div>
              ) : (
                <div className="details-rapport">
                  <div className="rapport-info">
                    <p><strong>ID:</strong> {rapportSelectionne.id_rapport}</p>
                    <p><strong>Titre:</strong> {rapportSelectionne.titre}</p>
                    <p><strong>Date de l'événement:</strong> {formatDate(rapportSelectionne.date_evenement)}</p>
                    <p><strong>Type:</strong> {getTypeEvenementLibelle(rapportSelectionne.id_type_evenement)}</p>
                    <p><strong>Sous-type:</strong> {getSousTypeEvenementLibelle(rapportSelectionne.id_sous_type_evenement)}</p>
                    <p><strong>Origine:</strong> {getOrigineEvenementLibelle(rapportSelectionne.id_origine_evenement)}</p>
                    <p><strong>Description:</strong> {rapportSelectionne.description_globale}</p>
                    {rapportSelectionne.id_zone && (
                      <p><strong>Zone:</strong> {getZoneNom(rapportSelectionne.id_zone)}</p>
                    )}
                    <p><strong>Opérateur responsable:</strong> {getOperateurNom(rapportSelectionne.id_operateur)}</p>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="modal-footer">
            {rapportSelectionne && !afficherHistorique && (
              <button
                className="btn btn-secondary"
                onClick={() => setAfficherHistorique(true)}
              >
                Voir l'historique
              </button>
            )}
            {rapportSelectionne && afficherHistorique && (
              <button
                className="btn btn-info"
                onClick={() => setAfficherHistorique(false)}
              >
                Voir les détails
              </button>
            )}
            {rapportSelectionne && userPeutModifier(rapportSelectionne) && (
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
                          <th>Niveau d'accès</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operateursAvecAcces.map(op => (
                          <tr key={op.id_operateur}>
                            <td>{op.prenom} {op.nom}</td>
                            <td>{op.peut_modifier ? 'Modification' : 'Lecture seule'}</td>
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
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={fermerGestionAcces}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeRapport;
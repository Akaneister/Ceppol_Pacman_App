import React, { useEffect, useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const DetailsRapport = ({
  rapportSelectionne,
  formatDate,
  getOperateurNom,
  getTypeEvenementLibelle,
  getSousTypeEvenementLibelle,
  getOrigineEvenementLibelle,
  getZoneNom,
  historique,
}) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [detailedRapport, setDetailedRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    infos: true,
    description: true,
    cible: false,
    localisation: false,
    meteo: false,
    alertes: false,
    responsable: false,
    acces: false,
    infosSupp: false,
    historique: false
  });

  // Fonction pour basculer l'état d'une section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fonction pour charger les détails complets du rapport
  const loadDetailedRapport = async (rapportId) => {
    if (!rapportId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API}/rapports/${rapportId}`);
      const rapportData = response.data.rapport || response.data;
      const metaData = response.data.metaData || {};

      console.log('📄 Données détaillées du rapport :', rapportData);
      console.log('📄 MetaData associées :', metaData);

      setDetailedRapport({ ...rapportData, metaData });
    } catch (error) {
      console.error('Erreur lors du chargement des détails du rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails quand le rapport sélectionné change
  useEffect(() => {
    if (rapportSelectionne?.id_rapport) {
      loadDetailedRapport(rapportSelectionne.id_rapport);
    }
  }, [rapportSelectionne?.id_rapport]);

  // Ajout : fonction pour charger Leaflet si besoin
  const loadLeaflet = () => {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/leaflet/dist/leaflet.js";
        script.onload = resolve;
        document.body.appendChild(script);
      }
    });
  };

  // Fonction pour vérifier si on a des coordonnées valides
  const hasValidCoordinates = () => {
    const rapport = detailedRapport || rapportSelectionne;
    const latitude = detailedRapport?.metaData?.localisation?.latitude || rapportSelectionne?.latitude;
    const longitude = detailedRapport?.metaData?.localisation?.longitude || rapportSelectionne?.longitude;

    return latitude && longitude &&
      !isNaN(parseFloat(latitude)) &&
      !isNaN(parseFloat(longitude)) &&
      latitude !== "Non définie" &&
      longitude !== "Non définie";
  };

  useEffect(() => {
  let isMounted = true;
  
  async function initMap() {
    if (!hasValidCoordinates() || !mapRef.current || !expandedSections.localisation) return;
    
    // Attendre que l'animation d'ouverture soit terminée
    await new Promise(resolve => setTimeout(resolve, 350));
    
    if (!isMounted) return;
    
    try {
      await loadLeaflet();
      if (!isMounted || !mapRef.current) return;
      
      // Nettoyer la carte existante
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      
      const latitude = detailedRapport?.metaData?.localisation?.latitude || rapportSelectionne?.latitude;
      const longitude = detailedRapport?.metaData?.localisation?.longitude || rapportSelectionne?.longitude;
      
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Vérifier les dimensions du conteneur
      const rect = mapRef.current.getBoundingClientRect();
      console.log('Dimensions du conteneur:', rect);
      
      if (rect.height === 0) {
        console.warn('Conteneur toujours sans hauteur');
        return;
      }
      
      leafletMapRef.current = window.L.map(mapRef.current).setView([lat, lng], 10);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);
      
      window.L.marker([lat, lng]).addTo(leafletMapRef.current);
      
      // Désactiver les interactions
      leafletMapRef.current.dragging.disable();
      leafletMapRef.current.touchZoom.disable();
      leafletMapRef.current.doubleClickZoom.disable();
      leafletMapRef.current.scrollWheelZoom.disable();
      leafletMapRef.current.boxZoom.disable();
      leafletMapRef.current.keyboard.disable();
      if (leafletMapRef.current.tap) leafletMapRef.current.tap.disable();
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  }
  
  initMap();
  
  return () => {
    isMounted = false;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
  };
}, [detailedRapport, rapportSelectionne, expandedSections.localisation, hasValidCoordinates]);

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (value) => {
    if (value === "Oui" || value === 1 || value === true) {
      return <span className="status-icon status-yes">✓</span>;
    }
    return <span className="status-icon status-no">✗</span>;
  };

  if (!rapportSelectionne) return null;

  const rapport = detailedRapport || rapportSelectionne;
  const metaData = detailedRapport?.metaData || {};

  if (loading && !detailedRapport) {
    return (
      <div className="details-rapport">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des détails du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="details-rapport">
      {/* En-tête simplifié sans priorité */}
      <div className="rapport-header">
        <div className="rapport-title-section">
          <h3>{rapport.titre}</h3>
          <div className="rapport-meta">
            <span className="rapport-id">ID: {rapport.id_rapport}</span>
          </div>
        </div>
        <div className="rapport-status">
          <div className="rapport-dates">
            <div className="date-item">
              <span className="date-label">Créé le</span>
              <span className="date-value">{formatDate(rapport.date_creation)}</span>
            </div>
            {rapport.date_modification && (
              <div className="date-item">
                <span className="date-label">Modifié le</span>
                <span className="date-value">{formatDate(rapport.date_modification)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rapport-sections">
        {/* Informations principales */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('infos')}>
            <h4>
              <span className="section-icon">📋</span>
              Informations principales
            </h4>
            <span className={`expand-icon ${expandedSections.infos ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.infos && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-label">Date de l'événement</span>
                  <span className="info-value">{formatDate(rapport.date_evenement)}</span>
                </div>
                <div className="info-card">
                  <span className="info-label">Type d'événement</span>
                  <span className="info-value info-tag type">
                    {getTypeEvenementLibelle(rapport.id_type_evenement)}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Sous-type</span>
                  <span className="info-value info-tag sous-type">
                    {getSousTypeEvenementLibelle(rapport.id_sous_type_evenement)}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Origine</span>
                  <span className="info-value info-tag origine">
                    {getOrigineEvenementLibelle(rapport.id_origine_evenement)}
                  </span>
                </div>
                {(metaData.localisation?.id_zone || rapport.id_zone_lieu) && (
                  <div className="info-card">
                    <span className="info-label">Zone géographique</span>
                    <span className="info-value info-tag zone">
                      {getZoneNom(metaData.localisation?.id_zone || rapport.id_zone_lieu)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description globale */}
        {rapport.description_globale && (
          <div className="rapport-section">
            <div className="section-header" onClick={() => toggleSection('description')}>
              <h4>
                <span className="section-icon">📝</span>
                Description globale
              </h4>
              <span className={`expand-icon ${expandedSections.description ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSections.description && (
              <div className="section-content">
                <div className="description-content">
                  {rapport.description_globale}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cible de l'événement */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('cible')}>
            <h4>
              <span className="section-icon">🎯</span>
              Cible de l'événement
            </h4>
            <span className={`expand-icon ${expandedSections.cible ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.cible && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-label">Type de cible</span>
                  <span className="info-value">
                    {metaData.typeCible?.libelle || rapport.type_cible_libelle || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Nom de la cible</span>
                  <span className="info-value">
                    {metaData.cible?.nom || rapport.nom_cible || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Pavillon</span>
                  <span className="info-value">
                    {metaData.cible?.pavillon || rapport.pavillon_cible || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Immatriculation</span>
                  <span className="info-value">
                    {metaData.cible?.immatriculation || rapport.immatriculation || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Type de produit</span>
                  <span className="info-value">
                    {metaData.cible?.TypeProduit || rapport.TypeProduit || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Quantité de produit</span>
                  <span className="info-value">
                    {metaData.cible?.QuantiteProduit || rapport.QuantiteProduit || "Non définie"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Localisation */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('localisation')}>
            <h4>
              <span className="section-icon">📍</span>
              Localisation
            </h4>
            <span className={`expand-icon ${expandedSections.localisation ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.localisation && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-label">Zone géographique</span>
                  <span className="info-value">
                    {getZoneNom(metaData.localisation?.id_zone || rapport.id_zone_lieu) || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Précision sur le lieu</span>
                  <span className="info-value">
                    {metaData.localisation?.details_lieu || rapport.details_lieu || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Coordonnées</span>
                  <span className="info-value coordinates">
                    {hasValidCoordinates() ?
                      `${metaData.localisation?.latitude || rapport.latitude}, ${metaData.localisation?.longitude || rapport.longitude}` :
                      "Non définies"
                    }
                  </span>
                </div>
              </div>
              {/* Afficher la carte seulement si on a des coordonnées valides */}
              {hasValidCoordinates() && (
                <div className="map-container">
                  <div
                    ref={mapRef}
                    className="map-display"
                    id={`map-details-rapport-${rapport.id_rapport}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conditions météorologiques */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('meteo')}>
            <h4>
              <span className="section-icon">🌤️</span>
              Conditions météorologiques
            </h4>
            <span className={`expand-icon ${expandedSections.meteo ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.meteo && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-card">
                  <span className="info-label">Direction du vent</span>
                  <span className="info-value">
                    {metaData.meteo?.direction_vent || rapport.direction_vent || "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Force du vent</span>
                  <span className="info-value">
                    {metaData.meteo?.force_vent ?? rapport.force_vent ?? "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">État de la mer</span>
                  <span className="info-value">
                    {metaData.meteo?.etat_mer ?? rapport.etat_mer ?? "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Nébulosité</span>
                  <span className="info-value">
                    {metaData.meteo?.nebulosite ?? rapport.nebulosite ?? "Non définie"}
                  </span>
                </div>
                <div className="info-card">
                  <span className="info-label">Marée</span>
                  <span className="info-value">
                    {metaData.meteo?.maree || rapport.maree || "Non définie"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alertes et contacts */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('alertes')}>
            <h4>
              <span className="section-icon">🚨</span>
              Contacts et alertes
            </h4>
            <span className={`expand-icon ${expandedSections.alertes ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.alertes && (
            <div className="section-content">
              <div className="alertes-grid">
                <div className="alerte-card">
                  <span className="alerte-label">CEDRE alerté</span>
                  {getStatusIcon((metaData.alertes?.cedre === 1 || rapport.cedre) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">CROSS alerté</span>
                  {getStatusIcon((metaData.alertes?.cross_contact === 1 || rapport.cross_contact) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">Photo</span>
                  {getStatusIcon((metaData.alertes?.photo === 1 || rapport.photo) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">POLREP</span>
                  {getStatusIcon((metaData.alertes?.polrep === 1 || rapport.polrep) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">Dérive MOTHY</span>
                  {getStatusIcon((metaData.alertes?.derive_mothy === 1 || rapport.derive_mothym) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">POLMAR Terre</span>
                  {getStatusIcon((metaData.alertes?.pne === 1 || rapport.pne) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">SMP</span>
                  {getStatusIcon((metaData.alertes?.smp === 1 || rapport.smp) ? "Oui" : "Non")}
                </div>
                <div className="alerte-card">
                  <span className="alerte-label">BSAA</span>
                  {getStatusIcon((metaData.alertes?.bsaa === 1 || rapport.bsaa) ? "Oui" : "Non")}
                </div>
              </div>

              {/* Informations supplémentaires sur les moyens */}
              <div className="moyens-section">
                <h5>Moyens et risques</h5>
                <div className="info-grid">
                  <div className="info-card">
                    <span className="info-label">Moyens à proximité</span>
                    <span className="info-value">
                      {metaData.alertes?.moyen_proximite || rapport.moyen_proximite || "Non défini"}
                    </span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Moyens dépêchés</span>
                    <span className="info-value">
                      {metaData.alertes?.moyen_depeche || rapport.moyen_depeche || "Non défini"}
                    </span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Risque court terme</span>
                    <span className="info-value">
                      {metaData.alertes?.risque_court_terme || rapport.risque_court_terme || "Non défini"}
                    </span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Risque moyen/long terme</span>
                    <span className="info-value">
                      {metaData.alertes?.risque_moyen_long_terme || rapport.risque_moyen_long_terme || "Non défini"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsable */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('responsable')}>
            <h4>
              <span className="section-icon">👤</span>
              Responsable
            </h4>
            <span className={`expand-icon ${expandedSections.responsable ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.responsable && (
            <div className="section-content">
              <div className="responsable-card">
                <div className="avatar">
                  {getOperateurNom(rapport.id_operateur).substring(0, 1).toUpperCase()}
                </div>
                <div className="responsable-details">
                  <div className="responsable-nom">{getOperateurNom(rapport.id_operateur)}</div>
                  <div className="responsable-date">Créé le {formatDate(rapport.date_creation)}</div>
                  {rapport.id_operateur_modification && (
                    <div className="responsable-modification">
                      Modifié par {getOperateurNom(rapport.id_operateur_modification)} le {formatDate(rapport.date_modification)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accès partagés */}
        {rapport.operateurs_acces && rapport.operateurs_acces.length > 0 && (
          <div className="rapport-section">
            <div className="section-header" onClick={() => toggleSection('acces')}>
              <h4>
                <span className="section-icon">👥</span>
                Accès partagés
              </h4>
              <span className={`expand-icon ${expandedSections.acces ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSections.acces && (
              <div className="section-content">
                <div className="acces-liste">
                  {rapport.operateurs_acces.map((opId) => (
                    <div key={opId} className="acces-item">
                      <span className="acces-avatar">{getOperateurNom(opId).substring(0, 1).toUpperCase()}</span>
                      <span className="acces-nom">{getOperateurNom(opId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informations supplémentaires */}
        {rapport.informations_supplementaires && (
          <div className="rapport-section">
            <div className="section-header" onClick={() => toggleSection('infosSupp')}>
              <h4>
                <span className="section-icon">ℹ️</span>
                Informations supplémentaires
              </h4>
              <span className={`expand-icon ${expandedSections.infosSupp ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSections.infosSupp && (
              <div className="section-content">
                <div className="infos-supp-content">
                  {rapport.informations_supplementaires}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Historique des actions */}
        <div className="rapport-section">
          <div className="section-header" onClick={() => toggleSection('historique')}>
            <h4>
              <span className="section-icon">📊</span>
              Historique des actions
              <span className="historique-count">({historique?.length || 0})</span>
            </h4>
            <span className={`expand-icon ${expandedSections.historique ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.historique && (
            <div className="section-content">
              <div className="historique-timeline">
                {historique && historique.length > 0 ? (
                  historique.map((action, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-date">
                            {new Date(action.date_action).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {action.type_action && (
                            <span className="timeline-type">{action.type_action}</span>
                          )}
                          {action.id_operateur && (
                            <span className="timeline-operator">
                              {getOperateurNom(action.id_operateur)}
                            </span>
                          )}
                        </div>
                        {action.detail_action && (
                          <div className="timeline-detail">
                            {action.detail_action}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-historique">Aucun historique disponible.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsRapport;
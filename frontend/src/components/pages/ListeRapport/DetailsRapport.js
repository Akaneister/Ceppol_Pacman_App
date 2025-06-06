import React, { useEffect, useRef } from "react";
import 'leaflet/dist/leaflet.css';

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

  useEffect(() => {
    let isMounted = true;
    async function initMap() {
      if (
        mapRef.current &&
        rapportSelectionne &&
        rapportSelectionne.metaData &&
        rapportSelectionne.metaData.localisation &&
        rapportSelectionne.metaData.localisation.latitude &&
        rapportSelectionne.metaData.localisation.longitude
      ) {
        await loadLeaflet();
        if (!isMounted) return;
        // Nettoyer la carte précédente si elle existe
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }
        const lat = parseFloat(rapportSelectionne.metaData.localisation.latitude);
        const lng = parseFloat(rapportSelectionne.metaData.localisation.longitude);
        leafletMapRef.current = window.L.map(mapRef.current, { 
          zoomControl: false, 
          dragging: false, 
          scrollWheelZoom: false, 
          doubleClickZoom: false, 
          boxZoom: false, 
          keyboard: false, 
          tap: false, 
          touchZoom: false 
        }).setView([lat, lng], 10);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMapRef.current);
        window.L.marker([lat, lng]).addTo(leafletMapRef.current);
        // Désactive toutes les interactions
        leafletMapRef.current.dragging.disable();
        leafletMapRef.current.touchZoom.disable();
        leafletMapRef.current.doubleClickZoom.disable();
        leafletMapRef.current.scrollWheelZoom.disable();
        leafletMapRef.current.boxZoom.disable();
        leafletMapRef.current.keyboard.disable();
        if (leafletMapRef.current.tap) leafletMapRef.current.tap.disable();
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
  }, [rapportSelectionne]);

  if (!rapportSelectionne) return null;

  // Récupération des metaData si présents
  const metaData = rapportSelectionne.metaData || {};
  const cible = metaData.cible || {};
  const localisation = metaData.localisation || {};
  const meteo = metaData.meteo || {};
  const alertes = metaData.alertes || {};

  return (
    <div className="details-rapport">
      <div className="rapport-header">
        <h3>{rapportSelectionne.titre}</h3>
        <span className="rapport-id">ID: {rapportSelectionne.id_rapport}</span>
      </div>

      <div className="rapport-sections">
        {/* Informations principales */}
        <div className="rapport-section infos-principales">
          <h4>Informations principales</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Date de l'événement:</span>
              <span className="info-value">{formatDate(rapportSelectionne.date_evenement)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value info-tag type">
                {getTypeEvenementLibelle(rapportSelectionne.id_type_evenement)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Sous-type:</span>
              <span className="info-value info-tag sous-type">
                {getSousTypeEvenementLibelle(rapportSelectionne.id_sous_type_evenement)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Origine:</span>
              <span className="info-value info-tag origine">
                {getOrigineEvenementLibelle(rapportSelectionne.id_origine_evenement)}
              </span>
            </div>
            {localisation.id_zone && (
              <div className="info-item">
                <span className="info-label">Zone géographique:</span>
                <span className="info-value info-tag zone">
                  {getZoneNom(localisation.id_zone)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description globale */}
        <div className="rapport-section description">
          <h4>Description globale</h4>
          <div className="description-content">
            {rapportSelectionne.description_globale}
          </div>
        </div>

        {/* Cible de l'événement */}
        <div className="rapport-section cible">
          <h4>Cible de l'événement</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Type de cible:</span>
              <span className="info-value">{cible.libelle}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nom de la cible:</span>
              <span className="info-value">{cible.nom || cible.nom_cible}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Pavillon:</span>
              <span className="info-value">{cible.pavillon || cible.pavillon_cible}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Immatriculation:</span>
              <span className="info-value">{cible.immatriculation}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type Produit:</span>
              <span className="info-value">{cible.TypeProduit}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Quantité Produit:</span>
              <span className="info-value">{cible.QuantiteProduit}</span>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="rapport-section localisation">
          <h4>Localisation</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Zone géographique:</span>
              <span className="info-value">{getZoneNom(localisation.id_zone)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Précision sur le lieu:</span>
              <span className="info-value">{localisation.details_lieu}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Latitude:</span>
              <span className="info-value">{localisation.latitude}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Longitude:</span>
              <span className="info-value">{localisation.longitude}</span>
            </div>
          </div>
          {/* Carte Leaflet affichant la position */}
          {localisation.latitude && localisation.longitude && (
            <div style={{ height: "250px", width: "100%", marginTop: "10px" }}>
              <div
                ref={mapRef}
                style={{ height: "100%", width: "100%", borderRadius: "8px", border: "1px solid #ccc" }}
                id="map-details-rapport"
              />
            </div>
          )}
        </div>

        {/* Conditions météorologiques */}
        <div className="rapport-section meteo">
          <h4>Conditions météorologiques</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Direction du vent:</span>
              <span className="info-value">{meteo.direction_vent}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Force du vent:</span>
              <span className="info-value">{meteo.force_vent}</span>
            </div>
            <div className="info-item">
              <span className="info-label">État de la mer:</span>
              <span className="info-value">{meteo.etat_mer}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nébulosité:</span>
              <span className="info-value">{meteo.nebulosite}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Marée:</span>
              <span className="info-value">{meteo.maree}</span>
            </div>
          </div>
        </div>

        {/* Alertes et contacts */}
        <div className="rapport-section alertes">
          <h4>Contacts et alertes</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">CEDRE alerté:</span>
              <span className="info-value">{alertes.cedre_alerte ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">CROSS alerté:</span>
              <span className="info-value">{alertes.cross_alerte ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Photo:</span>
              <span className="info-value">{alertes.photo ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">POLREP:</span>
              <span className="info-value">{alertes.polrep ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dérive MOTHY:</span>
              <span className="info-value">{alertes.derive_mothy ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">POLMAR Terre:</span>
              <span className="info-value">{alertes.polmar_terre ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">SMP:</span>
              <span className="info-value">{alertes.smp ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">BSAA:</span>
              <span className="info-value">{alertes.bsaa ? "Oui" : "Non"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Site sensible à proximité:</span>
              <span className="info-value">{alertes.sensible_proximite ? "Oui" : "Non"}</span>
            </div>
            {alertes.bsaa && (
              <div className="info-item">
                <span className="info-label">Délai d'appareillage:</span>
                <span className="info-value">{alertes.delai_appareillage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Moyens et risques */}
        <div className="rapport-section moyens">
          <h4>Moyens et risques</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Moyens à proximité:</span>
              <span className="info-value">{alertes.moyen_proximite}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Moyens dépêchés sur zone:</span>
              <span className="info-value">{alertes.moyen_depeche}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Moyens maritimes ou de l’État:</span>
              <span className="info-value">{alertes.moyen_marine_etat}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Risque court terme:</span>
              <span className="info-value">{alertes.risque_court_terme}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Risque moyen/long terme:</span>
              <span className="info-value">{alertes.risque_moyen_long_terme}</span>
            </div>
          </div>
        </div>

        {/* Responsable */}
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

        {/* Accès partagés */}
        {rapportSelectionne.operateurs_acces && rapportSelectionne.operateurs_acces.length > 0 && (
          <div className="rapport-section acces">
            <h4>Accès partagés</h4>
            <div className="acces-liste">
              {rapportSelectionne.operateurs_acces.map((opId) => (
                <div key={opId} className="acces-item">
                  <span className="acces-avatar">{getOperateurNom(opId).substring(0, 1).toUpperCase()}</span>
                  <span className="acces-nom">{getOperateurNom(opId)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations supplémentaires */}
        {rapportSelectionne.informations_supplementaires && (
          <div className="rapport-section infos-supp">
            <h4>Informations supplémentaires</h4>
            <div className="infos-supp-content">
              {rapportSelectionne.informations_supplementaires}
            </div>
          </div>
        )}

        {/* Historique des actions */}
        <div className="rapport-section historique">
          <h4>Historique des actions</h4>
          <div className="historique-list">
            {historique && historique.length > 0 ? (
              historique.map((action, idx) => (
                <div key={idx} className="historique-item">
                  <div>
                    <strong>
                      {new Date(action.date_action).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {" : "}
                      {action.type_action}
                    </strong>
                  </div>
                  <div>
                    {action.detail_action}
                  </div>
                </div>
              ))
            ) : (
              <div>Aucun historique disponible.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsRapport;
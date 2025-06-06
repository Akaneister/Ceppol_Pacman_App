import React from "react";

const Filtres = ({
  filtres,
  handleFiltreChange,
  toggleFiltres,
  filtresOuverts,
  reinitialiserFiltres,
  filtreActif,
  typeEvenements,
  sousTypeEvenements,
  origineEvenements,
  zones,
}) => {
  return (
    <div className="filtres-section">
      <button
        onClick={toggleFiltres}
        className="toggle-filtres-btn"
        title={filtresOuverts ? "Masquer les filtres" : "Afficher les filtres"}
      >
        {filtresOuverts ? "Masquer les filtres ▲" : "Afficher les filtres ▼"}
      </button>

      {filtresOuverts && (
        <div>
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
              <select
                name="sousType"
                id="sousType"
                value={filtres.sousType}
                onChange={handleFiltreChange}
              >
                <option value="">Tous</option>
                {sousTypeEvenements
                  .filter(st => !filtres.type || st.id_type_evenement === parseInt(filtres.type))
                  .map(sousType => (
                    <option key={sousType.id_sous_type_evenement} value={sousType.id_sous_type_evenement}>
                      {sousType.libelle}
                    </option>
                  ))}
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
              <label htmlFor="archive">Archiver:</label>
              <select name="archive" id="archive" value={filtres.archive} onChange={handleFiltreChange}>
                <option value="">Tous</option>
                <option value="1">Oui</option>
                <option value="0">Non</option>
              </select>
            </div>
          </div>

          <div className="filtres-actions">
            <button className="btn btn-secondary" onClick={reinitialiserFiltres}>
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {filtreActif && <div className="filtres-actifs">Filtres appliqués</div>}
    </div>
  );
};

export default Filtres;

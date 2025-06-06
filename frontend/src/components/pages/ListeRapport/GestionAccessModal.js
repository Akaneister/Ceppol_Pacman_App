import React from "react";

const GestionAccesModal = ({
  accessModalRef,
  rapportSelectionne,
  operateurs,
  operateursAvecAcces,
  nouvelOperateurAcces,
  handleNouvelOperateurChange,
  ajouterAccesOperateur,
  retirerAccesOperateur,
  fermerGestionAcces,
  afficherAjoutHistorique,
  afficherHistorique,
  setAfficherAjoutHistorique,
  setAfficherHistorique,
  nouvelHistorique,
  handleHistoriqueChange,
  ajouterHistoriqueManuel,
  fetchHistorique,
  setHistoriqueData,
}) => {
  if (!rapportSelectionne) return null;

  return (
    <div className="modal" ref={accessModalRef}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Gestion des accès au rapport</h2>
          <button className="close-btn" onClick={fermerGestionAcces}>&times;</button>
        </div>
        <div className="modal-body">
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
                    .filter(
                      (op) =>
                        op.id_operateur !== rapportSelectionne.id_operateur &&
                        !operateursAvecAcces.some((acc) => acc.id_operateur === op.id_operateur)
                    )
                    .map((op) => (
                      <option key={op.id_operateur} value={op.id_operateur}>
                        {op.prenom} {op.nom}
                      </option>
                    ))}
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
                      .filter((op) => op.id_operateur !== rapportSelectionne.id_operateur) // exclure l'opérateur principal
                      .map((op) => (
                        <tr key={op.id_operateur}>
                          <td>
                            {op.prenom} {op.nom}
                          </td>
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

          {afficherAjoutHistorique && (
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
          <button className="btn btn-primary" onClick={fermerGestionAcces}>
            Fermer
          </button>
          {!afficherHistorique && !afficherAjoutHistorique && (
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
  );
};

export default GestionAccesModal;

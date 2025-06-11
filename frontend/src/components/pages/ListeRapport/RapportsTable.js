import React from "react";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <ellipse cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
  </svg>
);



const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M14.7 5.3l-9 9V17h2.7l9-9-2.7-2.7z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M13.3 3.9a1.5 1.5 0 012.1 2.1l-1.1 1.1-2.1-2.1 1.1-1.1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M7 13l6-6" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="10" width="8" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="4" width="8" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RapportsTable = ({
  loading,
  error,
  rapportsFiltres,
  getTypeEvenementLibelle,
  getSousTypeEvenementLibelle,
  getOrigineEvenementLibelle,
  formatDate,
  getOperateurNom,
  voirDetails,
  voirHistorique,
  userPeutModifier,
  modifierRapport,
  authData,
  ouvrirGestionAcces,
}) => {
  return (
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
            {rapportsFiltres.map((rapport) => (
              <tr key={rapport.id_rapport}>
                <td>{rapport.titre}</td>
                <td>{getTypeEvenementLibelle(rapport.id_type_evenement)}</td>
                <td>{getSousTypeEvenementLibelle(rapport.id_sous_type_evenement)}</td>
                <td>{getOrigineEvenementLibelle(rapport.id_origine_evenement)}</td>
                <td>{formatDate(rapport.date_evenement)}</td>
                <td>{getOperateurNom(rapport.id_operateur)}</td>
                <td className="actions-cell flex gap-2">
                  <button
                    className="btn-icon text-info"
                    onClick={() => voirDetails(rapport)}
                    title="Voir détails"
                  >
                    <EyeIcon />
                  </button>


                  {userPeutModifier(rapport) && (
                    <button
                      className="btn-icon text-primary"
                      onClick={() => modifierRapport(rapport.id_rapport)}
                      title="Modifier le rapport"
                    >
                      <PencilIcon />
                    </button>
                  )}

                  {authData && rapport.id_operateur === authData.Opid && (
                    <button
                      className="btn-icon text-warning"
                      onClick={() => ouvrirGestionAcces(rapport)}
                      title="Gérer l'accès"
                    >
                      <LinkIcon />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RapportsTable;

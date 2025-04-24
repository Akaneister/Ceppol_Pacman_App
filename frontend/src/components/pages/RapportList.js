import React, { useEffect, useState } from 'react';
import API from '../../api';

const RapportList = () => {
  const [rapports, setRapports] = useState([]);

  useEffect(() => {
    API.get('/rapports')
      .then((res) => {
        // Vérifie la structure de la réponse de l'API
        console.log('Réponse de l\'API:', res.data);
  
        if (Array.isArray(res.data)) {
          setRapports(res.data);
        } else {
          console.error('Les données reçues ne sont pas un tableau');
        }
      })
      .catch((err) => {
        console.error('Erreur API:', err);
      });
  }, []);
  

  return (
    <div>
      <h2>📋 Liste des Rapports</h2>
      {rapports.length === 0 ? (
        <p>Aucun rapport trouvé.</p>
      ) : (
        <ul>
          {rapports.map((r) => (
            <li key={r.id_rapport}>
              <strong>{r.titre}</strong> — {r.date_rapport}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RapportList;

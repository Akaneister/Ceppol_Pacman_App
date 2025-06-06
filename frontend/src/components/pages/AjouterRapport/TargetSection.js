const TargetSection = ({ formData, handleChange }) => (
  <div className="form-section">
    <h2>Cible de l'Événement</h2>
    <div className="form-row">
      {[
        { id: 'libelle', label: 'Type de cible', placeholder: 'Ex: Navire' },
        { id: 'nom_cible', label: 'Nom de la cible', placeholder: 'Ex: Cargo XYZ' },
        { id: 'pavillon_cible', label: 'Pavillon', placeholder: 'Ex: France' },
        { id: 'immatriculation', label: 'Immatriculation', placeholder: 'Ex: MMSI/IMO' },
        { id: 'TypeProduit', label: 'Type Produit', placeholder: 'Ex: Fioul lourd' },
        { id: 'QuantiteProduit', label: 'Quantité Produit', placeholder: 'Ex: 1000L' }
      ].map(({ id, label, placeholder }) => (
        <div className="form-group col-md-6" key={id}>
          <label htmlFor={id}>{label}</label>
          <input
            type="text"
            id={id}
            name={id}
            value={formData[id]}
            onChange={handleChange}
            className="form-control"
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  </div>
);

export default TargetSection;

const ClassificationSection = ({
  formData,
  handleChange,
  typesEvenement,
  filteredSousTypes,
  originesEvenement
}) => (
  <div className="form-section">
    <h2>Classification de l'Événement</h2>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="id_type_evenement">Type d'événement *</label>
        <select
          id="id_type_evenement"
          name="id_type_evenement"
          value={formData.id_type_evenement}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">-- Sélectionner --</option>
          {typesEvenement.map(type => (
            <option key={type.id_type_evenement} value={type.id_type_evenement}>
              {type.libelle}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="id_sous_type_evenement">Précision du type</label>
        <select
          id="id_sous_type_evenement"
          name="id_sous_type_evenement"
          value={formData.id_sous_type_evenement}
          onChange={handleChange}
          className="form-control"
          disabled={!formData.id_type_evenement}
        >
          <option value="">-- Sélectionner --</option>
          {filteredSousTypes.map(sousType => (
            <option key={sousType.id_sous_type_evenement} value={sousType.id_sous_type_evenement}>
              {sousType.libelle}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="id_origine_evenement">Origine de l'événement</label>
      <select
        id="id_origine_evenement"
        name="id_origine_evenement"
        value={formData.id_origine_evenement}
        onChange={handleChange}
        className="form-control"
      >
        <option value="">-- Sélectionner --</option>
        {originesEvenement.map(orig => (
          <option key={orig.id_origine_evenement} value={orig.id_origine_evenement}>
            {orig.libelle}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default ClassificationSection;

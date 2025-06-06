const DescriptionSection = ({ formData, handleChange }) => (
  <div className="form-section">
    <h2>Description Détaillée</h2>
    <div className="form-group">
      <label htmlFor="description_globale">Description globale de l'événement *</label>
      <textarea
        id="description_globale"
        name="description_globale"
        value={formData.description_globale}
        onChange={handleChange}
        className="form-control"
        required
        rows="6"
      />
    </div>
  </div>
);

export default DescriptionSection;

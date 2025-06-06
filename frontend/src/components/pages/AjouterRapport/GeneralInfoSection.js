
const GeneralInfoSection = ({ formData, handleChange }) => (
  <div className="form-section">
    <h2>Informations Générales</h2>
    <div className="form-group">
      <label htmlFor="titre">
        Titre du rapport * <span className="tooltip-icon" title="Titre court">ℹ️</span>
      </label>
      <input
        id="titre"
        type="text"
        name="titre"
        value={formData.titre}
        onChange={handleChange}
        className="form-control"
        required
        maxLength="200"
        placeholder="Ex: Collision entre deux navires"
      />
    </div>
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="date_evenement">Date de l'événement *</label>
        <input
          id="date_evenement"
          type="date"
          name="date_evenement"
          value={formData.date_evenement}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="heure_evenement">Heure de l'événement *</label>
        <input
          id="heure_evenement"
          type="time"
          name="heure_evenement"
          value={formData.heure_evenement}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
    </div>
  </div>
);

export default GeneralInfoSection;
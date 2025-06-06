const MeteoSection = ({ formData, handleChange }) => (
  <div className="form-section">
    <h2>Conditions Météorologiques</h2>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="direction_vent">Direction du vent</label>
        <select
          name="direction_vent"
          value={formData.direction_vent}
          onChange={handleChange}
          className="form-control"
        >
          <option value="">-- Sélectionner --</option>
          <option value="N">Nord (N)</option>
          <option value="NE">Nord-Est (NE)</option>
          <option value="E">Est (E)</option>
          <option value="SE">Sud-Est (SE)</option>
          <option value="S">Sud (S)</option>
          <option value="SO">Sud-Ouest (SO)</option>
          <option value="O">Ouest (O)</option>
          <option value="NO">Nord-Ouest (NO)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="maree">Marée</label>
        <select
          name="maree"
          value={formData.maree}
          onChange={handleChange}
          className="form-control"
        >
          <option value="">-- Sélectionner --</option>
          <option value="haute">Haute</option>
          <option value="basse">Basse</option>
          <option value="montante">Montante</option>
          <option value="descendante">Descendante</option>
        </select>
      </div>
    </div>

    <div className="form-row">
      {[
        { id: 'force_vent', label: 'Force du vent (0–12)', max: 12 },
        { id: 'etat_mer', label: 'État de la mer (0–9)', max: 9 },
        { id: 'nebulosite', label: 'Nébulosité (0–9)', max: 9 }
      ].map(({ id, label, max }) => (
        <div className="form-group" key={id}>
          <label htmlFor={id}>{label}</label>
          <input
            type="range"
            id={id}
            name={id}
            min="0"
            max={max}
            value={formData[id] || 0}
            onChange={handleChange}
            className="form-control-range"
          />
          <div className="range-value">{formData[id] || '0'}</div>
        </div>
      ))}
    </div>
  </div>
);

export default MeteoSection;

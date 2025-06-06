const LocalisationSection = ({ formData, handleChange, mapRef, mapInitialized, zonesGeographiques }) => (
  <div className="form-section">
    <h2>Localisation de l'Événement</h2>

    <div className="form-group">
      <label htmlFor="id_zone">Zone géographique *</label>
      <select
        id="id_zone"
        name="id_zone"
        value={formData.id_zone}
        onChange={handleChange}
        className="form-control"
        required
      >
        <option value="">-- Sélectionner une zone --</option>
        {zonesGeographiques.map(zone => (
          <option key={zone.id_zone} value={zone.id_zone}>{zone.nom_zone}</option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="details_lieu">Précision sur le lieu</label>
      <textarea
        id="details_lieu"
        name="details_lieu"
        value={formData.details_lieu}
        onChange={handleChange}
        className="form-control"
        rows="3"
      />
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="latitude">Latitude</label>
        <input
          id="latitude"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="longitude">Longitude</label>
        <input
          id="longitude"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          className="form-control"
        />
      </div>
    </div>
    <form className="form-group">
    
    <div className="map-container">
      <label>Carte (cliquez pour définir un point)</label>
      <div ref={mapRef} className="location-map" style={{ height: '600px', width: '100%', marginTop: '10px' }}>
        {!mapInitialized && <div className="map-loading">Chargement de la carte...</div>}
      </div>
    </div>
    </form>
  </div>
);

export default LocalisationSection;

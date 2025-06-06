const AlertesSection = ({ formData, handleChange }) => {
    const showDelaiAppareillage = formData.bsaa;

    return (
        <div className="form-section">
            <h2>Contacts et Alertes</h2>
            <div className="checkbox-grid">
                {[
                    { id: 'cedre_alerte', label: 'CEDRE alerté' },
                    { id: 'cross_alerte', label: 'CROSS alerté' },
                    { id: 'photo', label: 'Photo' },
                    { id: 'message_polrep', label: 'POLREP' },
                    { id: 'derive_mothy', label: 'Dérive MOTHY' },
                    { id: 'polmar_terre', label: 'POLMAR Terre' },
                    { id: 'smp', label: 'SMP' },
                    { id: 'sensible_proximite', label: 'Site sensible à proximité' },
                    { id: 'bsaa', label: 'BSAA' }
                ].map(({ id, label }) => (
                    <div className="checkbox-item" key={id}>
                        <input type="checkbox" id={id} name={id} checked={formData[id]} onChange={handleChange} />
                        <label htmlFor={id}>{label}</label>
                    </div>
                ))}
            </div>

            {showDelaiAppareillage && (
                <div className="form-group">
                    <label htmlFor="delai_appareillage">Délai d'appareillage</label>
                    <input
                        id="delai_appareillage"
                        type="datetime-local"
                        name="delai_appareillage"
                        value={formData.delai_appareillage}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Sélectionnez la date et l'heure"
                    />
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="moyen_proximite">Moyens à proximité</label>
                    <input
                        type="text"
                        name="moyen_proximite"
                        value={formData.moyen_proximite}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Ex : Vedette SNSM, remorqueur..."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="moyen_depeche">Moyens dépêchés</label>
                    <input
                        type="text"
                        name="moyen_depeche"
                        value={formData.moyen_depeche}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Ex : Hélicoptère, navire..."
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="moyen_marine_etat">Moyens maritimes ou de l’État</label>
                <input
                    type="text"
                    name="moyen_marine_etat"
                    value={formData.moyen_marine_etat}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ex : Marine nationale, Douanes..."
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="risque_court_terme">Risque à court terme</label>
                    <input
                        type="text"
                        name="risque_court_terme"
                        value={formData.risque_court_terme}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Décrivez le risque immédiat"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="risque_moyen_long_terme">Risque moyen/long terme</label>
                    <input
                        type="text"
                        name="risque_moyen_long_terme"
                        value={formData.risque_moyen_long_terme}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Décrivez le risque à moyen/long terme"
                    />
                </div>
            </div>
        </div>
    );
};

export default AlertesSection;

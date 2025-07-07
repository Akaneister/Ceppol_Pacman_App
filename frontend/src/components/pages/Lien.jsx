import React, { useEffect, useState } from "react";
import "../css/Lien.css"; // Importer le fichier CSS pour les styles

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Lien = () => {
    const [liens, setLiens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLienData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/ressources/lien`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setLiens(data);
                setError(null);
            } catch (error) {
                console.error("There was a problem with the fetch operation:", error);
                setError("Erreur lors du chargement des liens");
            } finally {
                setLoading(false);
            }
        };
        
        fetchLienData();
    }, []);

    if (loading) {
        return (
            <div className="lien-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Chargement des liens...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lien-container">
                <div className="error-message">
                    <h2>Erreur</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Réessayer</button>
                </div>
            </div>
        );
    }

    return (
        <div className="lien-container">
            <div className="lien-header">
                <h1>Liens Utiles</h1>
            </div>

            <div className="liens-grid">
                {liens.length > 0 ? (
                    liens.map((lien, index) => (
                        <div key={index} className="lien-card">
                            <div className="lien-icon">
                                <i className="fas fa-external-link-alt"></i>
                            </div>
                            <div className="lien-content">
                                <h3 className="lien-title">{lien.titre || lien.name || `Lien ${index + 1}`}</h3>
                                
                            </div>
                            <div className="lien-actions">
                                <a 
                                    href={lien.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="lien-button"
                                >
                                    Visiter
                                    <i className="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-liens">
                        <div className="no-liens-icon">
                            <i className="fas fa-link"></i>
                        </div>
                        <h3>Aucun lien disponible</h3>
                        <p>Il n'y a actuellement aucun lien à afficher.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lien;



import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/AuthPage.css';

// Utiliser l'URL de l'API correctement selon l'environnement
const API = process.env.REACT_APP_API_URL;

const AuthPage = () => {
    const { login } = useAuth();
    const [motdepasse, setMotdepasse] = useState('');
    const [operateurs, setOperateurs] = useState([]);
    const [selectedOperateur, setSelectedOperateur] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        console.log("URL de l'API utilisée:", API);
        if (!API) {
            console.error("L'URL de l'API n'est pas définie. Vérifiez vos variables d'environnement.");
        }
    }, []);

    const handlePasswordSubmit = async () => {
        if (!motdepasse) {
            setError('Veuillez entrer un mot de passe');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Tentative de connexion avec le mot de passe
            const res = await axios.post(`${API}/auth/login`, { motdepasse });

            // Si la réponse contient une erreur (ex: "Accès refusé")
            if (res.data.success === false || res.data.message !== 'Accès autorisé') {
                setError('Mot de passe incorrect');
                setLoading(false);
                return; // Empêche la progression
            }

            // Si le mot de passe est correct, récupérer les opérateurs
            const opsRes = await axios.get(`${API}/auth/operateurs`);
            const operateursData = opsRes.data.data[0]; // Accéder au premier tableau de opérateurs
            setOperateurs(operateursData);
            setStep(2); // Passer à l'étape 2 (choisir un opérateur)
        } catch (err) {
            console.error("Erreur lors de la connexion", err);
            if (err.response) {
                setError(`Erreur ${err.response.status}: ${err.response.data.message || "Erreur lors de la connexion"}`);
            } else {
                setError('Erreur de connexion');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOperateurSubmit = () => {
        if (!selectedOperateur) {
            setError('Veuillez sélectionner un opérateur');
            return;
        }

        const operateur = operateurs.find(op => op.id_operateur === parseInt(selectedOperateur));
        
        if (operateur) {
            login(motdepasse, {
                nom: `${operateur.prenom} ${operateur.nom}`,
                id_operateur: operateur.id_operateur
            });
            navigate('/'); // Rediriger après connexion réussie
        } else {
            setError('Opérateur introuvable');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (step === 1) handlePasswordSubmit();
            if (step === 2) handleOperateurSubmit();
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <img
                        src="https://media.licdn.com/dms/image/v2/D4D03AQFJe7wGLcgcog/profile-displayphoto-shrink_800_800/B4DZUdjj0rG8Ac-/0/1739957616593?e=1750896000&v=beta&t=qAYqbLuaphKto29HlKAn_gf273y4racUKhCwvUSvE4Q"
                        alt="Profile"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #ccc'
                        }}
                    />
                </div>

                <div className="auth-card">
                    {step === 1 && (
                        <div className="auth-step auth-step-1">
                            <h2 className="auth-title">Connexion</h2>
                            <div className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="password">Mot de passe</label>
                                    <input
                                        id="password"
                                        type="password"
                                        className="form-control"
                                        value={motdepasse}
                                        onChange={e => setMotdepasse(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        autoFocus
                                    />
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <button
                                    className={`auth-button ${loading ? 'loading' : ''}`}
                                    onClick={handlePasswordSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Vérification...' : 'Valider'}
                                    <span className="button-effect"></span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="auth-step auth-step-2">
                            <h2 className="auth-title">Sélectionnez un opérateur</h2>
                            <div className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="operateur">Opérateur</label>
                                    <select
                                        id="operateur"
                                        className="form-control"
                                        value={selectedOperateur}
                                        onChange={e => setSelectedOperateur(e.target.value)}
                                    >
                                        <option value="">-- Choisir un opérateur --</option>
                                        {operateurs.map(op => (
                                            <option key={op.id_operateur} value={op.id_operateur}>
                                                {op.prenom} {op.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <div className="buttons-group">
                                    <button
                                        className="auth-button secondary"
                                        onClick={() => {
                                            setStep(1);
                                            setError('');
                                        }}
                                    >
                                        Retour
                                        <span className="button-effect"></span>
                                    </button>
                                    <button
                                        className="auth-button"
                                        onClick={handleOperateurSubmit}
                                    >
                                        Continuer
                                        <span className="button-effect"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

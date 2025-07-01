/**
 * ==================================================================================
 *                           COMPOSANT AUTHPAGE - PAGE D'AUTHENTIFICATION
 * ==================================================================================
 * 
 * @file AuthPage.js
 * @location frontend/src/components/pages/AuthPage.js
 * @description Composant de gestion de l'authentification pour l'application MarineV3
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • Authentification en deux étapes (mot de passe + sélection opérateur)
 * • Gestion des connexions administrateur et opérateur
 * • Validation automatique du type d'utilisateur via l'API
 * • Interface utilisateur intuitive avec gestion d'erreurs
 * • Redirection automatique selon le type d'utilisateur
 * • Gestion des états de chargement et d'erreur
 * 
 * FLUX D'AUTHENTIFICATION :
 * ────────────────────────────────────────────────────────────────────────────────
 * 1. Étape 1 : Saisie du mot de passe
 * 2. Validation du mot de passe via l'API
 * 3. Détection automatique du type d'utilisateur (admin/opérateur)
 * 4. Admin : Connexion directe + redirection vers /admin
 * 5. Opérateur : Étape 2 - Sélection de l'opérateur dans la liste
 * 6. Finalisation de la connexion + redirection vers la page d'accueil
 * 
 * TYPES D'UTILISATEURS :
 * ────────────────────────────────────────────────────────────────────────────────
 * • Admin : Accès complet à l'administration (dashboard admin)
 * • Opérateur : Accès limité aux fonctionnalités métier (rapports, cartes)
 * 
 * DÉPENDANCES :
 * ────────────────────────────────────────────────────────────────────────────────
 * • React (hooks: useState, useEffect)
 * • Axios (requêtes HTTP vers l'API)
 * • React Router (navigation et redirection)
 * • AuthContext (gestion de l'état d'authentification global)
 * 
 * API UTILISÉE :
 * ────────────────────────────────────────────────────────────────────────────────
 * • POST /auth/login - Validation du mot de passe et détection du type utilisateur
 * • GET /auth/operateurs - Récupération de la liste des opérateurs disponibles
 * 
 * @author Oscar Vieujean 
 * ==================================================================================
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/AuthPage.css';
import logoImg from '../../ressources/Logo.jpeg';

// Configuration de l'URL de l'API selon l'environnement
const API = process.env.REACT_APP_API_URL;

const AuthPage = () => {
    // ═══════════════════════════════════════════════════════════════════════════════
    // HOOKS ET ÉTAT LOCAL
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Récupération des fonctions d'authentification depuis le contexte
    const { login, loginAdmin } = useAuth();
    
    // Navigation programmatique
    const navigate = useNavigate();
    
    // États pour la gestion de l'authentification
    const [motdepasse, setMotdepasse] = useState('');              // Mot de passe saisi
    const [operateurs, setOperateurs] = useState([]);             // Liste des opérateurs disponibles
    const [selectedOperateur, setSelectedOperateur] = useState(''); // Opérateur sélectionné
    const [step, setStep] = useState(1);                          // Étape courante (1: mot de passe, 2: sélection opérateur)
    const [loading, setLoading] = useState(false);               // État de chargement
    const [error, setError] = useState('');                      // Message d'erreur
    const [userType, setUserType] = useState('');               // Type d'utilisateur ('operateur' ou 'admin')

    // ═══════════════════════════════════════════════════════════════════════════════
    // EFFET DE VÉRIFICATION DE L'API AU MONTAGE DU COMPOSANT
    // ═══════════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        // Vérification de la configuration de l'API pour le débogage
        console.log("URL de l'API utilisée:", API);
        if (!API) {
            console.error("L'URL de l'API n'est pas définie. Vérifiez vos variables d'environnement.");
        }
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════════
    // GESTION DE LA SOUMISSION DU MOT DE PASSE (ÉTAPE 1)
    // ═══════════════════════════════════════════════════════════════════════════════
    const handlePasswordSubmit = async () => {
        // Validation de la saisie
        if (!motdepasse) {
            setError('Veuillez entrer un mot de passe');
            return;
        }

        // Initialisation de l'état de chargement
        setLoading(true);
        setError('');

        try {
            // Tentative de connexion avec le mot de passe via l'API
            const res = await axios.post(`${API}/auth/login`, { motdepasse });

            console.log('Réponse de l\'API:', res.data);

            // Vérification du succès de la requête
            if (res.data.success === false) {
                setError(res.data.error || 'Mot de passe incorrect');
                setLoading(false);
                return;
            }

            // Détermination du type d'utilisateur à partir de la réponse API
            const typeUtilisateur = res.data.userType || res.data.type;
            
            if (typeUtilisateur === 'admin' || res.data.info === 'Admin') {
                // ─── CONNEXION ADMINISTRATEUR ───
                // Connexion directe sans sélection d'opérateur
                console.log('Connexion admin détectée');
                setUserType('admin');
                loginAdmin(motdepasse);
                navigate('/admin'); // Redirection vers le dashboard administrateur
            } else {
                // ─── CONNEXION OPÉRATEUR ───
                // Récupération de la liste des opérateurs pour la sélection
                console.log('Connexion opérateur détectée');
                setUserType('operateur');
                const opsRes = await axios.get(`${API}/auth/operateurs`);
                const operateursData = opsRes.data.data[0]; // Extraction du premier tableau d'opérateurs
                setOperateurs(operateursData);
                setStep(2); // Passage à l'étape 2 (sélection de l'opérateur)
            }
        } catch (err) {
            // Gestion des erreurs de connexion
            console.error("Erreur lors de la connexion", err);
            if (err.response) {
                // Erreur HTTP avec réponse du serveur
                setError(`Erreur ${err.response.status}: ${err.response.data.error || err.response.data.message || "Erreur lors de la connexion"}`);
            } else {
                // Erreur réseau ou autre
                setError('Erreur de connexion');
            }
        } finally {
            // Arrêt de l'état de chargement dans tous les cas
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // GESTION DE LA SÉLECTION DE L'OPÉRATEUR (ÉTAPE 2)
    // ═══════════════════════════════════════════════════════════════════════════════
    const handleOperateurSubmit = () => {
        // Validation de la sélection
        if (!selectedOperateur) {
            setError('Veuillez sélectionner un opérateur');
            return;
        }

        // Recherche de l'opérateur sélectionné dans la liste
        const operateur = operateurs.find(op => op.id_operateur === parseInt(selectedOperateur));
        
        if (operateur) {
            // Finalisation de la connexion avec les données de l'opérateur
            login(motdepasse, {
                nom: `${operateur.prenom} ${operateur.nom}`,
                id_operateur: operateur.id_operateur,
                type: 'operateur'
            });
            navigate('/'); // Redirection vers la page d'accueil après connexion réussie
        } else {
            setError('Opérateur introuvable');
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // GESTION DES ÉVÉNEMENTS CLAVIER (NAVIGATION AVEC ENTRÉE)
    // ═══════════════════════════════════════════════════════════════════════════════
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // Soumission selon l'étape courante
            if (step === 1) handlePasswordSubmit();
            if (step === 2) handleOperateurSubmit();
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDU DU COMPOSANT
    // ═══════════════════════════════════════════════════════════════════════════════
    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* ─── LOGO DE L'APPLICATION ─── */}
                <div className="auth-logo">
                    <img
                        src={logoImg}
                        alt="Profile"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #ccc',
                            transition: 'transform 0.3s ease'
                        }}
                        className="auth-logo-img"
                    />
                </div>

                {/* Styles CSS-in-JS pour l'effet hover du logo */}
                <style jsx>{`
                    .auth-logo-img:hover {
                        transform: scale(1.08);
                    }
                `}</style>

                <div className="auth-card">
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* ÉTAPE 1 : SAISIE DU MOT DE PASSE */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
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
                                        placeholder="Entrez votre mot de passe"
                                    />
                                </div>
                                {/* Affichage conditionnel des erreurs */}
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

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* ÉTAPE 2 : SÉLECTION DE L'OPÉRATEUR */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {step === 2 && userType === 'operateur' && (
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
                                        {/* Génération dynamique des options à partir de la liste des opérateurs */}
                                        {operateurs.map(op => (
                                            <option key={op.id_operateur} value={op.id_operateur}>
                                                {op.prenom} {op.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Affichage conditionnel des erreurs */}
                                {error && <div className="error-message">{error}</div>}
                                <div className="buttons-group">
                                    {/* Bouton de retour à l'étape précédente */}
                                    <button
                                        className="auth-button secondary"
                                        onClick={() => {
                                            setStep(1);
                                            setError('');
                                            setUserType('');
                                        }}
                                    >
                                        Retour
                                        <span className="button-effect"></span>
                                    </button>
                                    {/* Bouton de validation de la sélection */}
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
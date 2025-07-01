/**
==================================================================================
==================================================================================
@file AdminDashboard.jsx
@location frontend/src/components/pages/AdminDashboard.jsx
@description Composant principal du tableau de bord administrateur de l'application MarineV3
FONCTIONNALITÉS PRINCIPALES :
────────────────────────────────────────────────────────────────────────────────
• Interface d'administration complète avec navigation par onglets
• Gestion des opérateurs (CRUD : création, lecture, modification, suppression)
• Gestion des mots de passe via composant Password
• Gestion des documents via composant Documents
• Navigation responsive avec menu mobile (hamburger)
• Authentification stricte (vérification admin obligatoire)
• Persistance de l'onglet actif dans localStorage et URL hash
• Gestion des états de chargement, erreur et succès
STRUCTURE DU COMPOSANT :
────────────────────────────────────────────────────────────────────────────────
• AdminDashboard : Composant principal avec navigation et routage des onglets
• OperateursTab : Sous-composant dédié à la gestion des opérateurs
• Navigation : Menu latéral avec icônes et menu mobile responsive
• Zones modulaires : Dashboard, Passwords, Operateurs, Documents
SÉCURITÉ :
────────────────────────────────────────────────────────────────────────────────
• Vérification de l'authentification utilisateur
• Vérification des droits administrateur
• Redirection automatique si non autorisé
• Gestion sécurisée des opérations CRUD
API UTILISÉE :
────────────────────────────────────────────────────────────────────────────────
• GET /auth/operateurs - Récupération de la liste des opérateurs
• DELETE /admin/operateurs/:id - Suppression d'un opérateur
• PUT /admin/operateurs/:id - Modification d'un opérateur
@author Oscar Vieujean
==================================================================================
*/

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Key,
    BarChart3,
    File,
    LogOut,
    Trash2,
    Edit,
    Save,
    X
} from 'lucide-react';

import '../css/AdminDashboard.css';
import Password from './Admin/Password';
import Documents from './Admin/Documents';

 /**
 * Composant principal du tableau de bord administrateur
 * Gère l'authentification, la navigation par onglets et l'affichage des différentes sections
 */
const AdminDashboard = () => {
    const { isAdmin, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // État de l'onglet actif - récupéré depuis l'URL hash ou localStorage
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || localStorage.getItem('adminActiveTab') || 'operateurs';
    });

    // État du menu mobile pour la navigation responsive
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // État des opérateurs pour la gestion CRUD
    const [operateurs, setOperateurs] = useState([]);
    const API = process.env.REACT_APP_API_URL;

    // Vérification de sécurité : redirection si non authentifié ou non admin
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        if (!isAdmin) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, isAdmin, navigate]);

    // Fonction pour charger la liste des opérateurs depuis l'API
    const loadOperateurs = useCallback(async () => {
        try {
            const response = await fetch(`${API}/auth/operateurs`);
            const data = await response.json();
            if (data.success) {
                setOperateurs(data.data[0] || []);
            }
        } catch (err) {
            setOperateurs([]);
        }
    }, [API]);

    // Chargement des opérateurs quand l'onglet correspondant est actif
    useEffect(() => {
        if (isAdmin && isAuthenticated && activeTab === 'operateurs') {
            loadOperateurs();
        }
    }, [isAdmin, isAuthenticated, activeTab, loadOperateurs]);

    // Synchronisation de l'onglet actif avec l'URL hash et localStorage
    useEffect(() => {
        window.location.hash = activeTab;
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    // Écoute des changements d'URL hash pour synchroniser les onglets
    useEffect(() => {
        const onHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== activeTab) {
                setActiveTab(hash);
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [activeTab]);    // Fonction de déconnexion avec redirection
    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    // Gestion du menu mobile - ouverture/fermeture
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Changement d'onglet avec fermeture automatique du menu mobile
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false); // Fermer le menu mobile après sélection
    };    // Fermeture du menu mobile lors d'un clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('.admin-nav')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Gestion du scroll du body selon l'état du menu mobile
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }

        // Nettoyer à la fermeture du composant
        return () => {
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMobileMenuOpen]);

    // Écran de chargement si l'utilisateur n'est pas autorisé
    if (!isAuthenticated || !isAdmin) {
        return <div className="centered-screen">Chargement...</div>;
    }

    return (
        <div className="admin-dashboard-root">
            {/* Overlay semi-transparent pour le menu mobile */}
            <div 
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            <div className="admin-main">
                {/* Navigation latérale avec menu responsive */}
                <nav className="admin-nav">
                    <div className="admin-nav-container">
                        {/* Bouton hamburger pour mobile */}
                        <button 
                            className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                            onClick={toggleMobileMenu}
                            aria-label="Toggle navigation menu"
                        >
                            <div className="hamburger-bar"></div>
                            <div className="hamburger-bar"></div>
                            <div className="hamburger-bar"></div>
                        </button>
                        
                        {/* Liste des onglets de navigation */}
                        <ul className={`admin-nav-list ${isMobileMenuOpen ? 'active' : ''}`}>
                            {[
                                { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
                                { id: 'passwords', label: 'Mots de passe', icon: Key },
                                { id: 'operateurs', label: 'Opérateurs', icon: Users },
                                { id: 'documents', label: 'Documents', icon: File }
                            ].map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`admin-nav-btn ${activeTab === tab.id ? 'admin-nav-btn-active' : ''}`}
                                        >
                                            <Icon className="admin-nav-icon" />
                                            <span>{tab.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                            {/* Bouton de déconnexion */}
                            <li onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="admin-logout-btn">
                                <button><LogOut className="admin-logout-icon" />Déconnexion</button>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* En-tête de l'interface admin */}
                <header className="admin-header">
                    <div className="admin-header-container">
                        <div className="admin-header-content">
                            <div className="admin-header-left">
                                <br></br>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Affichage conditionnel du contenu selon l'onglet actif */}
                {/* Zone tableau de bord - À développer */}
                {activeTab === 'dashboard' && (
                    <div className="admin-placeholder">
                        <h2>Tableau de bord</h2>
                        <div>Zone à préparer</div>
                    </div>
                )}
                {/* Zone gestion des mots de passe */}
                {activeTab === 'passwords' && (
                    <div className="admin-placeholder">
                        <h2>Gestion des mots de passe</h2>
                        <Password />
                    </div>
                )}
                {/* Zone gestion des opérateurs */}
                {activeTab === 'operateurs' && (
                    <OperateursTab operateurs={operateurs} onReload={loadOperateurs} />
                )}
                {/* Zone gestion des documents */}
                {activeTab === 'documents' && (
                    <div className="admin-placeholder">
                        
                        <Documents />
                    </div>
                )}
            </div>
        </div>
    );
};

 /**
 * Composant dédié à la gestion des opérateurs
 * Permet la consultation, modification et suppression des opérateurs
 * @param {Array} operateurs - Liste des opérateurs
 * @param {Function} onReload - Fonction de rechargement des données
 */
const OperateursTab = ({ operateurs, onReload }) => {
    // États pour la gestion de l'édition en ligne
    const [editId, setEditId] = useState(null); // ID de l'opérateur en cours d'édition
    const [editData, setEditData] = useState({ nom: '', prenom: '' }); // Données temporaires d'édition
    const [loading, setLoading] = useState(false); // État de chargement pour les opérations
    const [error, setError] = useState(''); // Messages d'erreur
    const [success, setSuccess] = useState(''); // Messages de succès
    const API = process.env.REACT_APP_API_URL;

    // Rechargement automatique des données au montage du composant
    useEffect(() => {
        onReload();
        // eslint-disable-next-line
    }, [onReload]);

    /**
     * Formate une date ISO en format français lisible
     * @param {string} isoString - Date au format ISO
     * @returns {string} Date formatée ou chaîne vide
     */
    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fonction utilitaire pour effacer les messages d'état
    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    /**
     * Gère la suppression d'un opérateur
     * Demande confirmation puis effectue la suppression via l'API
     * @param {Object} operateur - L'opérateur à supprimer
     */
    const handleDelete = async (operateur) => {
        const id = operateur.id || operateur._id || operateur.id_operateur;
        const nom = `${operateur.nom || ''} ${operateur.prenom || ''}`.trim();

        // Demande de confirmation avant suppression
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'opérateur ${nom} ?`)) return;

        setLoading(true);
        clearMessages();

        try {
            const response = await fetch(`${API}/admin/operateurs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la suppression');
            }

            // Affichage du message de succès et rechargement des données
            setSuccess('Opérateur supprimé avec succès');
            onReload();
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Active le mode édition pour un opérateur
     * Prépare les données temporaires pour la modification
     * @param {Object} op - L'opérateur à modifier
     */
    const handleEdit = (op) => {
        const id = op.id || op._id || op.id_operateur;
        setEditId(id);
        setEditData({
            nom: op.nom || '',
            prenom: op.prenom || ''
        });
        clearMessages();
    };

    /**
     * Annule le mode édition
     * Remet à zéro les données temporaires
     */
    const handleCancelEdit = () => {
        setEditId(null);
        setEditData({ nom: '', prenom: '' });
        clearMessages();
    };

    /**
     * Sauvegarde les modifications d'un opérateur
     * Valide les données puis envoie la requête PUT à l'API
     * @param {Object} operateur - L'opérateur à modifier
     */
    const handleSaveEdit = async (operateur) => {
        const id = operateur.id || operateur._id || operateur.id_operateur;

        // Validation des champs obligatoires
        if (!editData.nom.trim() || !editData.prenom.trim()) {
            setError('Le nom et le prénom sont requis');
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            const response = await fetch(`${API}/admin/operateurs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: editData.nom.trim(),
                    prenom: editData.prenom.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la modification');
            }

            // Sortie du mode édition et rechargement des données
            setEditId(null);
            setEditData({ nom: '', prenom: '' });
            setSuccess('Opérateur modifié avec succès');
            onReload();
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="operators-section">
            <h2 className="operators-title">Liste des opérateurs</h2>
            {/* Affichage des messages d'état */}
            {error && <div className="operator-error" style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
            {success && <div className="operator-success" style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>{success}</div>}
            {loading && <div style={{ marginBottom: '10px' }}>Traitement en cours...</div>}
            
            {/* Liste des opérateurs ou message si vide */}
            {operateurs.length === 0 ? (
                <p>Aucun opérateur trouvé.</p>
            ) : (
                <ul className="operators-list">
                    {operateurs.map((op) => {
                        const id = op.id || op._id || op.id_operateur;
                        const isEditing = editId === id;

                        return (
                            <li key={id} className="operator-item">
                                {isEditing ? (
                                    // Mode édition : formulaire en ligne
                                    <div className="operator-edit-form">
                                        <div className="operator-edit-inputs">
                                            <input
                                                className="operator-edit-input"
                                                type="text"
                                                value={editData.nom}
                                                onChange={e => setEditData({ ...editData, nom: e.target.value })}
                                                placeholder="Nom"
                                                disabled={loading}
                                            />
                                            <input
                                                className="operator-edit-input"
                                                type="text"
                                                value={editData.prenom}
                                                onChange={e => setEditData({ ...editData, prenom: e.target.value })}
                                                placeholder="Prénom"
                                                disabled={loading}
                                            />
                                        </div>
                                        {/* Boutons de sauvegarde et annulation */}
                                        <div className="operator-actions">
                                            <button
                                                className="operator-btn operator-btn-save"
                                                onClick={() => handleSaveEdit(op)}
                                                disabled={loading}
                                                style={{ color: 'green' }}
                                            >
                                                <Save size={16} /> Sauver
                                            </button>
                                            <button
                                                className="operator-btn operator-btn-cancel"
                                                onClick={handleCancelEdit}
                                                disabled={loading}
                                                style={{ color: 'gray' }}
                                            >
                                                <X size={16} /> Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Mode lecture : affichage des informations
                                    <>
                                        <div className="operator-info">
                                            <span className="operator-name">
                                                {op.nom || ''} {op.prenom || ''}
                                            </span>
                                            <span className="operator-meta">
                                                {formatDate(op.date_creation)}
                                            </span>
                                        </div>
                                        {/* Boutons d'action : modifier et supprimer */}
                                        <div className="operator-actions">
                                            <button
                                                className="operator-btn operator-btn-edit"
                                                onClick={() => handleEdit(op)}
                                                disabled={loading}
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="operator-btn operator-btn-delete"
                                                onClick={() => handleDelete(op)}
                                                disabled={loading}
                                                style={{ color: '#D72638' }}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AdminDashboard;

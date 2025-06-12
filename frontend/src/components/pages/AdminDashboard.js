import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Key,
    BarChart3,
    File,
    LogOut,
    Plus,
    Trash2,
    Eye,
    Shield,
    UserCheck,
    EyeOff,
    Edit,
    Save,
    X
} from 'lucide-react';

import '../css/AdminDashboard.css';

const AdminDashboard = () => {
    const { isAdmin, isAuthenticated, logout, operateurNom } = useAuth();
    const navigate = useNavigate();

    // Initialisation de l'onglet actif selon le hash ou le localStorage
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || localStorage.getItem('adminActiveTab') || 'dashboard';
    });
    const [stats, setStats] = useState({});
    const [passwords, setPasswords] = useState([]);
    const [operateurs, setOperateurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API = process.env.REACT_APP_API_URL;

    // Vérifications de sécurité
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

    // Charger les données initiales
    useEffect(() => {
        if (isAdmin && isAuthenticated) {
            loadStats();
            loadPasswords();
            loadOperateurs();
        }
    }, [isAdmin, isAuthenticated]);

    const loadStats = async () => {
        try {
            const response = await fetch(`${API}/auth/stats`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des statistiques:', err);
        }
    };

    const loadPasswords = async () => {
        try {
            const response = await fetch(`${API}/auth/passwords`);
            const data = await response.json();
            if (data.success) {
                setPasswords(data.data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des mots de passe:', err);
        }
    };

    const loadOperateurs = async () => {
        try {
            const response = await fetch(`${API}/auth/operateurs`);
            const data = await response.json();
            if (data.success) {
                setOperateurs(data.data[0] || []);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des opérateurs:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    // Synchronise le hash et le localStorage à chaque changement d'onglet
    useEffect(() => {
        window.location.hash = activeTab;
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    // Si l'utilisateur change le hash manuellement ou via le bouton précédent/suivant du navigateur
    useEffect(() => {
        const onHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== activeTab) {
                setActiveTab(hash);
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [activeTab]);

    if (!isAuthenticated || !isAdmin) {
        return <div className="centered-screen">Chargement...</div>;
    }

    return (
        <div className="admin-dashboard-root">
            <div className="admin-main">
                <nav className="admin-nav">
                    <ul className="admin-nav-list">
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
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`admin-nav-btn ${activeTab === tab.id ? 'admin-nav-btn-active' : ''}`}
                                    >
                                        <Icon className="admin-nav-icon" />
                                        <span>{tab.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                        <li onClick={handleLogout} className="admin-logout-btn">
                            <button><LogOut className="admin-logout-icon" />Déconnexion</button>
                        </li>
                    </ul>
                </nav>

                <header className="admin-header">
                    <div className="admin-header-container">
                        <div className="admin-header-content">
                            <div className="admin-header-left">
                                <div>
                                    <h1 className="admin-title">Panneau d'Administration</h1>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenu principal */}
                {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
                {activeTab === 'passwords' && <PasswordsTab passwords={passwords} onReload={loadPasswords} />}
                {activeTab === 'operateurs' && <OperateursTab operateurs={operateurs} onReload={loadOperateurs} />}
                {activeTab === 'documents' && <DocumentsTab />}
            </div>
        </div>
    );
};

// Composants placeholders corrigés
const DashboardTab = ({ stats }) => {
    return <div><h2>Tableau de bord</h2></div>;
};

const StatCard = ({ title, value, icon: Icon, color }) => {
    return <div></div>;
};

const PasswordsTab = ({ passwords, onReload }) => {
    return <div><h2>Gestion des mots de passe</h2></div>;
};

const OperateursTab = ({ operateurs, onReload }) => {
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ nom: '', prenom: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        onReload();
        // eslint-disable-next-line
    }, []);

    // Fonction utilitaire pour formater la date
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

    // Fonction pour réinitialiser les messages
    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    // Supprimer un opérateur
    const handleDelete = async (operateur) => {
        const id = operateur.id || operateur._id || operateur.id_operateur;
        const nom = `${operateur.nom || ''} ${operateur.prenom || ''}`.trim();
        
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
            
            setSuccess('Opérateur supprimé avec succès');
            onReload();
            
            // Effacer le message de succès après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError(err.message || 'Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    // Préparer l'édition
    const handleEdit = (op) => {
        const id = op.id || op._id || op.id_operateur;
        setEditId(id);
        setEditData({
            nom: op.nom || '',
            prenom: op.prenom || ''
        });
        clearMessages();
    };

    // Annuler l'édition
    const handleCancelEdit = () => {
        setEditId(null);
        setEditData({ nom: '', prenom: '' });
        clearMessages();
    };

    // Sauvegarder l'édition
    const handleSaveEdit = async (operateur) => {
        const id = operateur.id || operateur._id || operateur.id_operateur;
        
        // Validation basique
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
            
            setEditId(null);
            setEditData({ nom: '', prenom: '' });
            setSuccess('Opérateur modifié avec succès');
            onReload();
            
            // Effacer le message de succès après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            console.error('Erreur modification:', err);
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="operators-section">
            <h2 className="operators-title">Liste des opérateurs</h2>
            
            {/* Messages d'erreur et de succès */}
            {error && <div className="operator-error" style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>{error}</div>}
            {success && <div className="operator-success" style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>{success}</div>}
            
            {loading && <div style={{ marginBottom: '10px' }}>Traitement en cours...</div>}
            
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
                                    // Mode édition
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
                                    // Mode affichage
                                    <>
                                        <div className="operator-info">
                                            <span className="operator-name">
                                                {op.nom || ''} {op.prenom || ''}
                                            </span>
                                            <span className="operator-meta">
                                                {formatDate(op.date_creation)}
                                                
                                            </span>
                                        </div>
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

const DocumentsTab = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch(`${API}/admin/documents`);
                const data = await response.json();

                if (Array.isArray(data)) {
                    setDocuments(data);
                } else {
                    setError("Réponse inattendue du serveur.");
                }
            } catch (err) {
                setError("Erreur de connexion au serveur.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [API]);

    if (loading) return <p>Chargement des documents...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="documents-section">
            <h2 className="documents-title">Liste des documents</h2>

            {documents.length === 0 ? (
                <p className="documents-empty">Aucun document trouvé.</p>
            ) : (
                <ul className="documents-list">
                    {documents.map((doc) => (
                        <li key={doc.id} className="document-item">
                            <div className="document-icon">
                                {doc.type === 'pdf' ? '📄' : '📁'}
                            </div>
                            <div className="document-info">
                                <div className="document-name">{doc.nom}</div>
                                <div className="document-type">Type : {doc.type}</div>
                                <a
                                    href={`${API}/viewressources/${doc.chemin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="document-link"
                                >
                                    🔗 Voir le document
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminDashboard;
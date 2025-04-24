// Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css'; 


const Navbar = () => {
  const { authData, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Gestion du scroll pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Ferme le menu mobile lors du changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Vérifie si le lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Gère la déconnexion
  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <header className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar">

        {/* Bouton menu burger pour mobile */}
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation principale */}
        <nav className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="navbar-links">
            <li className={isActive('/') ? 'active' : ''}>
              <Link to="/">
                <span className="link-icon">🏠</span>
                <span className="link-text">Accueil</span>
              </Link>
            </li>
            
            {/* Les liens suivants sont visibles uniquement si l'utilisateur est authentifié */}
            {authData.isAuthenticated && (
              <>
                <li className={isActive('/ajouter-rapport') ? 'active' : ''}>
                  <Link to="/ajouter-rapport">
                    <span className="link-icon">📝</span>
                    <span className="link-text">Ajouter un rapport</span>
                  </Link>
                </li>
                <li className={isActive('/liste-rapports') ? 'active' : ''}>
                  <Link to="/liste-rapports">
                    <span className="link-icon">📋</span>
                    <span className="link-text">Liste des rapports</span>
                  </Link>
                </li>
                <li className={isActive('/carte') ? 'active' : ''}>
                  <Link to="/carte">
                    <span className="link-icon">🗺️</span>
                    <span className="link-text">Carte</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          {/* Partie droite de la navbar avec connexion/déconnexion */}
          <div className="navbar-auth">
            {authData.isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-avatar">{authData.selectedOperateur ? authData.selectedOperateur.charAt(0) : 'U'}</span>
                  <span className="user-name">{authData.selectedOperateur || 'Utilisateur'}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <span className="link-icon">🚪</span>
                  <span className="link-text">Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className={`login-button ${isActive('/login') ? 'active' : ''}`}>
                <span className="link-icon">🔑</span>
                <span className="link-text">Connexion</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
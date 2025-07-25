// Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
//Version CSS 
import '../css/Navbar.css';

// Composants d'icônes SVG blanches
const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 18H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H3.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12H3.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 18H3.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 6.13401 6.13401 3 10 3H14C17.866 3 21 6.13401 21 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11C13.5705 10.4259 13.0226 9.95090 12.3934 9.60712C11.7643 9.26334 11.0685 9.05892 10.3533 9.00771C9.63819 8.95650 8.92037 9.05969 8.24864 9.31025C7.57691 9.56082 6.96687 9.95303 6.46 10.46L3.46 13.46C2.54918 14.403 2.04520 15.6661 2.0566 16.9770C2.06799 18.288 2.59383 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17L21 12L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoginIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 17L15 12L10 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
            <li className={isActive('/doc') ? 'active' : ''}>
              <Link to="/doc">
                <span className="link-icon"><DocumentIcon /></span>
                <span className="link-text">Documentation</span>
              </Link>
            </li>

            {/* Les liens suivants sont visibles uniquement si l'utilisateur est authentifié */}
            {authData.isAuthenticated && (
              <>
                <li className={isActive('/ajouter-rapport') || isActive('/') ? 'active' : ''}>
                  <Link to="/ajouter-rapport">
                    <span className="link-icon"><EditIcon /></span>
                    <span className="link-text">Ajouter un rapport</span>
                  </Link>
                </li>
                <li className={isActive('/liste-rapports') ? 'active' : ''}>
                  <Link to="/liste-rapports">
                    <span className="link-icon"><ListIcon /></span>
                    <span className="link-text">Rapports</span>
                  </Link>
                </li>
                <li className={isActive('/carte') ? 'active' : ''}>
                  <Link to="/carte">
                    <span className="link-icon"><MapIcon /></span>
                    <span className="link-text">Carte</span>
                  </Link>
                </li>
                <li className={isActive('/liens') ? 'active' : ''}>
                  <Link to="/liens">
                    <span className="link-icon"><LinkIcon /></span>
                    <span className="link-text">Liens</span>
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
                  <span className="user-avatar" style={{ color: 'white' }}>
                    {authData.selectedOperateur ? authData.selectedOperateur.charAt(0) : 'U'}
                  </span>
                  <span className="user-name">{authData.selectedOperateur || 'Utilisateur'}</span>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <span className="link-icon"><LogoutIcon /></span>
                  <span className="link-text">Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className={`login-button ${isActive('/login') ? 'active' : ''}`}>
                <span className="link-icon"><LoginIcon /></span>
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
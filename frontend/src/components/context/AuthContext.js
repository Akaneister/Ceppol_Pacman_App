// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    isAuthenticated: false,
    motdepasse: null,
    selectedOperateur: null, // Nom de l'opérateur pour l'affichage
    Opid: null,              // ID de l'opérateur
    userType: null,          // 'admin' ou 'operateur'
    isAdmin: false,          // Booléen pour vérifier si c'est un admin
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('authData');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        console.log("Données d'authentification récupérées du localStorage:", parsedAuth);
        setAuthData(parsedAuth);
      } else {
        console.log("Aucune donnée d'authentification trouvée dans le localStorage");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données d'authentification:", error);
      // Réinitialiser le localStorage en cas d'erreur de parsing
      localStorage.removeItem('authData');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de connexion pour les opérateurs
  const login = (motdepasse, operateur) => {
    console.log("Fonction login appelée avec les paramètres:", { motdepasse: "***", operateur });
    
    if (!operateur || !operateur.id_operateur) {
      console.error("Paramètres d'opérateur invalides:", operateur);
      return;
    }
    
    const auth = {
      motdepasse,
      selectedOperateur: operateur.nom,  // Nom pour l'affichage
      Opid: operateur.id_operateur,      // ID de l'opérateur
      isAuthenticated: true,
      userType: operateur.type || 'operateur',
      isAdmin: operateur.type === 'admin',
    };
  
    console.log("Nouvelles données d'authentification:", { ...auth, motdepasse: "***" });
    
    // Mettre à jour l'état local
    setAuthData(auth);
    
    // Mettre à jour le localStorage
    try {
      localStorage.setItem('authData', JSON.stringify(auth));
      console.log("Données d'authentification sauvegardées dans le localStorage");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données d'authentification:", error);
    }
  };

  // Fonction de connexion pour les admins
  const loginAdmin = (motdepasse) => {
    console.log("Fonction loginAdmin appelée");
    
    const auth = {
      motdepasse,
      selectedOperateur: 'Administrateur',  // Nom pour l'affichage
      Opid: 'admin',                        // ID spécial pour admin
      isAuthenticated: true,
      userType: 'admin',
      isAdmin: true,
    };
  
    console.log("Nouvelles données d'authentification admin:", { ...auth, motdepasse: "***" });
    
    // Mettre à jour l'état local
    setAuthData(auth);
    
    // Mettre à jour le localStorage
    try {
      localStorage.setItem('authData', JSON.stringify(auth));
      console.log("Données d'authentification admin sauvegardées dans le localStorage");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données d'authentification admin:", error);
    }
  };
  
  const logout = () => {
    console.log("Déconnexion de l'utilisateur");
    
    // Réinitialiser l'état
    setAuthData({
      isAuthenticated: false,
      motdepasse: null,
      selectedOperateur: null,
      Opid: null,
      userType: null,
      isAdmin: false,
    });
    
    // Supprimer du localStorage
    try {
      localStorage.removeItem('authData');
      console.log("Données d'authentification supprimées du localStorage");
    } catch (error) {
      console.error("Erreur lors de la suppression des données d'authentification:", error);
    }
  };

  // Valeurs exposées par le contexte
  const contextValue = {
    authData,
    login,
    loginAdmin,
    logout,
    loading,
    // Ajouter des getters pratiques
    isAuthenticated: authData.isAuthenticated,
    operateurNom: authData.selectedOperateur,
    operateurId: authData.Opid,
    userType: authData.userType,
    isAdmin: authData.isAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
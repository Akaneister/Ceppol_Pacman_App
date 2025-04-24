// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    isAuthenticated: false,
    motdepasse: null,
    selectedOperateur: null, // Nom de l'opérateur pour l'affichage
    Opid: null,              // ID de l'opérateur
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
  
  const logout = () => {
    console.log("Déconnexion de l'utilisateur");
    
    // Réinitialiser l'état
    setAuthData({
      isAuthenticated: false,
      motdepasse: null,
      selectedOperateur: null,
      Opid: null,
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
    logout,
    loading,
    // Ajouter des getters pratiques
    isAuthenticated: authData.isAuthenticated,
    operateurNom: authData.selectedOperateur,
    operateurId: authData.Opid
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
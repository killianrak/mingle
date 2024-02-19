import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  // Vérifier l'état d'authentification lors du chargement de l'application
  useEffect(() => {
    fetch("http://localhost:8000/check-cookie", {
        method: "GET",
        credentials: "include",  // Inclure les cookies dans la requête
    })
        .then(response => {
            if (!response.ok) {

                setLoggedIn(false)
                
            }
            else {
                setLoggedIn(true);
            }
        })
        
    
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
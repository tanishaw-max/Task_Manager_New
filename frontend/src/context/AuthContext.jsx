import { createContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("rbac_user");
    const storedToken = localStorage.getItem("rbac_token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        api.setToken(storedToken);
        return parsedUser;
      } catch {
        localStorage.removeItem("rbac_user");
        localStorage.removeItem("rbac_token");
      }
    }
    return null;
  });
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const login = (userData, token) => {
    if (!userData?._id || !userData?.role || !token) {
      setError("Invalid login data");
      return;
    }

    localStorage.setItem("rbac_user", JSON.stringify(userData));
    localStorage.setItem("rbac_token", token);
    api.setToken(token);
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem("rbac_user");
    localStorage.removeItem("rbac_token");
    api.setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export { AuthContext };

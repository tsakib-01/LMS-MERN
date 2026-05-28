import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        setUserState(JSON.parse(userData));
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    try {
      // ✅ Handles both shapes from Login page:
      // Shape 1 (current): { id, name, email, role, avatar, token }  ← flat
      // Shape 2 (future):  { token, user: { id, name, ... } }        ← nested
      const token = userData.token;
      
      let userOnly;
      if (userData.user) {
        // Shape 2 — nested
        userOnly = { ...userData.user };
      } else {
        // Shape 1 — flat, strip token out
        userOnly = { ...userData };
        delete userOnly.token;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userOnly));
      setUserState(userOnly);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // ✅ setUser syncs both state AND localStorage atomically
  const setUser = (updatedUser) => {
    try {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserState(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginUser, registerUser, logoutUser, getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("taskflow_user");
    return stored ? JSON.parse(stored) : null;
  });

  // Verify JWT and sync user data on load
  useEffect(() => {
    const token = localStorage.getItem("taskflow_token");
    if (token) {
      getMe()
        .then((data) => {
          // data here is already unwrapped because of auth.js .then((r) => r.data)
          // Actually getMe returns { success: true, data: { id, fullName, email } }
          const userData = data.data;
          setUser(userData);
          localStorage.setItem("taskflow_user", JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem("taskflow_token");
          localStorage.removeItem("taskflow_user");
          setUser(null);
        });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem("taskflow_token", data.data.token);
    localStorage.setItem("taskflow_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const res = await registerUser({ fullName, email, password });
    localStorage.setItem("taskflow_token", res.data.token);
    localStorage.setItem("taskflow_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("taskflow_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

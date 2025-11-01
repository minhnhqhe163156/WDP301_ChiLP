import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose setUser function globally for Google login
  useEffect(() => {
    window.authContext = { setUser };
    return () => {
      delete window.authContext;
    };
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      console.log("[AuthContext] Lấy từ localStorage:", { token, storedUser });
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("[AuthContext] User parse từ localStorage:", parsedUser);
          // Đảm bảo name được decode đúng UTF-8
          if (parsedUser.name) {
            console.log("[AuthContext] Original name:", parsedUser.name);
          }
          setUser(parsedUser);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (err) {
          console.error("[AuthContext] Lỗi parse user từ localStorage:", err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post("https://localhost:5000/api/auth/login", {
      email,
      password,
    });

    const { token, user: userData } = response.data;
    console.log("[AuthContext] Kết quả login:", { token, userData });

    // Đảm bảo userData có _id nếu backend trả về id
    if (userData && !userData._id && userData.id) {
      userData._id = userData.id;
    }

    if (!userData || !userData.role || !userData._id) {
      console.error(
        "[AuthContext] User trả về từ API thiếu trường role hoặc _id:",
        userData
      );
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    setUser, // Thêm setUser vào context
  };

  if (loading) return <div>Loading...</div>; // hoặc spinner đẹp hơn

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

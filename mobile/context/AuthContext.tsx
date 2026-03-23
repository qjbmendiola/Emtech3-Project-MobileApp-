import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthType = {
  user: any;
  token: string | null;
  login: (userData: any, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthType>({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /////////////////////////////////////////////////////////
  // 🔥 AUTO LOGIN ON APP START
  /////////////////////////////////////////////////////////
  useEffect(() => {
    const loadAuth = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      const savedToken = await AsyncStorage.getItem("token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }

      setLoading(false);
    };

    loadAuth();
  }, []);

  /////////////////////////////////////////////////////////
  // 🔐 LOGIN
  /////////////////////////////////////////////////////////
  const login = async (userData: any, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);

    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("token", jwtToken);
  };

  /////////////////////////////////////////////////////////
  // 🚪 LOGOUT
  /////////////////////////////////////////////////////////
  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
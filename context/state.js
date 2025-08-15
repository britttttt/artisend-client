import { createContext, useContext, useEffect, useState } from 'react';
import { getUserProfile } from '../data/auth';
import { useRouter } from "next/router";

const AppContext = createContext();

export function AppWrapper({ children }) {
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const authRoutes = ['/login', '/register'];
    if (token) {
      localStorage.setItem('token', token);
      if (!authRoutes.includes(router.pathname)) {
        getUserProfile()
          .then((profileData) => {
            if (profileData) {
              setProfile(profileData);
            }
          })
          .catch((err) => {
            console.error("Error fetching profile:", err);
            setProfile(null);
          })
          .finally(() => {
            setLoadingProfile(false);
          });
      } else {
        setLoadingProfile(false);
      }
    }
  }, [token, router.pathname]);

  return (
    <AppContext.Provider value={{ profile, token, setToken, setProfile, loadingProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}


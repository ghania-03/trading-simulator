import {
  createContext,
  useEffect,
  useState,
} from "react";

import usePortfolioStore from "../store/portfolioStore";

const AuthContext = createContext(null);

const STORAGE_KEY =
  "trading-simulator-auth";

export function AuthProvider({
  children,
}) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] =
    useState(false);

  const setActiveUser =
    usePortfolioStore(
      (state) => state.setActiveUser,
    );

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          STORAGE_KEY,
        );

      if (storedUser) {
        const parsedUser =
          JSON.parse(storedUser);

        if (
          parsedUser &&
          parsedUser.id &&
          parsedUser.email
        ) {
          setUser(parsedUser);
          setActiveUser(
            String(parsedUser.id),
          );
        }
      }
    } catch {
      localStorage.removeItem(
        STORAGE_KEY,
      );
    } finally {
      setIsInitialized(true);
    }
  }, [setActiveUser]);

  function login(authenticatedUser) {
    setUser(authenticatedUser);

    setActiveUser(
      String(authenticatedUser.id),
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        authenticatedUser,
      ),
    );
  }

  function logout() {
    setUser(null);

    setActiveUser(null);

    localStorage.removeItem(
      STORAGE_KEY,
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
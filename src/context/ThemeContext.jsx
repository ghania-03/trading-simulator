import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY =
  "trading-simulator-theme";

function getInitialTheme() {
  const storedTheme =
    localStorage.getItem(STORAGE_KEY);

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return "dark";
}

function applyTheme(theme) {
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark",
  );

  document.documentElement.style.colorScheme =
    theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    getInitialTheme,
  );

  useEffect(() => {
    applyTheme(theme);

    localStorage.setItem(
      STORAGE_KEY,
      theme,
    );
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark",
    );
  }, []);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}

export default ThemeContext;
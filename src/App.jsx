import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import AssetDetail from "./pages/AssetDetail";
import Leaderboard from "./pages/Leaderboard";

import { PriceFeedProvider } from "./context/PriceFeedContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PriceAlertProvider } from "./context/PriceAlertContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";
import NotificationContainer from "./components/NotificationContainer";
import ThemeToggle from "./components/ThemeToggle";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <NavLink
            to="/app/market"
            className="shrink-0 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Trading Simulator
          </NavLink>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 md:flex"
          >
            <NavLink
              to="/app/market"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              Market
            </NavLink>

            <NavLink
              to="/app/portfolio"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              Portfolio
            </NavLink>

            <NavLink
              to="/app/leaderboard"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              Leaderboard
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <LogoutButton />
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="border-t border-slate-100 px-4 py-2 dark:border-slate-800 md:hidden"
      >
        <div className="mx-auto flex max-w-7xl gap-1">
          <NavLink
            to="/app/market"
            className={({ isActive }) =>
              `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            Market
          </NavLink>

          <NavLink
            to="/app/portfolio"
            className={({ isActive }) =>
              `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            Portfolio
          </NavLink>

          <NavLink
            to="/app/leaderboard"
            className={({ isActive }) =>
              `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            Leaderboard
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <Navigation />

      <main className="min-h-[calc(100vh-73px)] bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/market"
            element={<Market />}
          />

          <Route
            path="/portfolio"
            element={<Portfolio />}
          />

          <Route
            path="/asset/:id"
            element={<AssetDetail />}
          />

          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />

          <Route
            path="/"
            element={
              <Navigate
                to="/app/market"
                replace
              />
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <PriceFeedProvider>
            <PriceAlertProvider>
              <NotificationContainer />

              <Routes>
                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/app/*"
                  element={<ProtectedApp />}
                />

                <Route
                  path="/"
                  element={
                    <Navigate
                      to="/app/market"
                      replace
                    />
                  }
                />

                <Route
                  path="*"
                  element={<NotFound />}
                />
              </Routes>
            </PriceAlertProvider>
          </PriceFeedProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import {
  BrowserRouter,
  Navigate,
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

import ProtectedRoute from "./components/ProtectedRoute";
import LogoutButton from "./components/LogoutButton";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <LogoutButton />

      <Routes>
        <Route
          path="market"
          element={<Market />}
        />

        <Route
          path="portfolio"
          element={<Portfolio />}
        />

        <Route
          path="asset/:id"
          element={<AssetDetail />}
        />

        <Route
          path="leaderboard"
          element={<Leaderboard />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="market"
              replace
            />
          }
        />
      </Routes>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PriceFeedProvider>
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
        </PriceFeedProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import AssetDetail from "./pages/AssetDetail";
import Leaderboard from "./pages/Leaderboard";

import { PriceFeedProvider } from "./context/PriceFeedContext";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <PriceFeedProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/app/market" element={<Market />} />

          <Route path="/app/portfolio" element={<Portfolio />} />

          <Route path="/app/asset/:id" element={<AssetDetail />} />

          <Route path="/app/leaderboard" element={<Leaderboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </PriceFeedProvider>
    </BrowserRouter>
  );
}

export default App;
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddPlayersPage from "./pages/admin/AddPlayersPage";
import AddMatchesPage from "./pages/admin/AddMatchesPage";
import MatchSetupPage from "./pages/admin/MatchSetupPage";
import ScorecardPage from "./pages/admin/ScorecardPage";
import ResultsPage from "./pages/admin/ResultsPage";
import PointsTablePage from "./pages/admin/PointsTablePage";
import UserHomePage from "./pages/user/UserHomePage";
import UserMatchListPage from "./pages/user/UserMatchListPage";
import UserMatchDetailsPage from "./pages/user/UserMatchDetailsPage";
import UserPointsTablePage from "./pages/user/UserPointsTablePage";
import UserPlayerStatsPage from "./pages/user/UserPlayerStatsPage";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page-shell">
        <Routes>
          <Route path="/" element={<UserHomePage />} />
          <Route path="/matches" element={<UserMatchListPage />} />
          <Route path="/matches/:matchId" element={<UserMatchDetailsPage />} />
          <Route path="/points" element={<UserPointsTablePage />} />
          <Route path="/stats" element={<UserPlayerStatsPage />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/players" element={<AddPlayersPage />} />
          <Route path="/admin/matches" element={<AddMatchesPage />} />
          <Route path="/admin/setup" element={<MatchSetupPage />} />
          <Route path="/admin/scorecard" element={<ScorecardPage />} />
          <Route path="/admin/results" element={<ResultsPage />} />
          <Route path="/admin/points" element={<PointsTablePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
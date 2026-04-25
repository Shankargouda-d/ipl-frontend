import { Routes, Route, Navigate } from "react-router-dom";
import AdminGate from "./pages/admin/AdminGate";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddPlayersPage from "./pages/admin/AddPlayersPage";
import AddMatchesPage from "./pages/admin/AddMatchesPage";
import MatchSetupPage from "./pages/admin/MatchSetupPage";
import ScorecardPage from "./pages/admin/ScorecardPage";
import UserHomePage from "./pages/user/UserHomePage";
import UserMatchListPage from "./pages/user/UserMatchListPage";
import UserMatchDetailsPage from "./pages/user/UserMatchDetailsPage";
import UserPlayerStatsPage from "./pages/user/UserPlayerStatsPage";
import UserPointsTablePage from "./pages/user/UserPointsTablePage";
import UserTeamStatsPage from "./pages/user/UserTeamStatsPage";


function AdminProtected({ children }) {
  const isAdmin = sessionStorage.getItem("ipl_admin") === "true";
  return isAdmin ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserHomePage />} />
      <Route path="/matches" element={<UserMatchListPage />} />
      <Route path="/matches/:id" element={<UserMatchDetailsPage />} />
      <Route path="/stats" element={<UserPlayerStatsPage />} />
      <Route path="/points" element={<UserPointsTablePage />} />
      <Route path="/team-stats" element={<UserTeamStatsPage />} />


      <Route path="/admin" element={<AdminGate />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtected>
            <AdminDashboard />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/players"
        element={
          <AdminProtected>
            <AddPlayersPage />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/matches/add"
        element={
          <AdminProtected>
            <AddMatchesPage />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/matches/:id/setup"
        element={
          <AdminProtected>
            <MatchSetupPage />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/matches/:id/scorecard"
        element={
          <AdminProtected>
            <ScorecardPage />
          </AdminProtected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
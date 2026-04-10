import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="sidebar">
      <h3>Admin Panel</h3>
      <Link to="/admin">Dashboard</Link>
      <Link to="/admin/players">Players</Link>
      <Link to="/admin/matches">Matches</Link>
      <Link to="/admin/setup">Setup</Link>
      <Link to="/admin/scorecard">Scorecard</Link>
      <Link to="/admin/results">Results</Link>
      <Link to="/admin/points">Points</Link>
    </aside>
  );
}

export default AdminSidebar;
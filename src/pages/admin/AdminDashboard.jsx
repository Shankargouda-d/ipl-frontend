import AdminSidebar from "../../components/AdminSidebar";

function AdminDashboard() {
  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <div className="card">
          <h2>Admin Dashboard</h2>
          <p>Manage teams, players, matches, toss, squads, innings, results, and points table.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
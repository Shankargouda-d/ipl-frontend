import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getPointsTable } from "../../api/pointsApi";

function PointsTablePage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getPointsTable().then(setRows);
  }, []);

  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <h2>Points Table</h2>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>M</th>
                <th>W</th>
                <th>L</th>
                <th>T</th>
                <th>Pts</th>
                <th>NRR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.team_id}>
                  <td>{row.team_name}</td>
                  <td>{row.matches_played}</td>
                  <td>{row.won}</td>
                  <td>{row.lost}</td>
                  <td>{row.tied}</td>
                  <td>{row.points}</td>
                  <td>{row.net_run_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PointsTablePage;
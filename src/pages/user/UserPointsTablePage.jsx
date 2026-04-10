import { useEffect, useState } from "react";
import { getPointsTable } from "../../api/pointsApi";

function UserPointsTablePage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getPointsTable().then(setRows);
  }, []);

  return (
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
                <td>{row.points}</td>
                <td>{row.net_run_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserPointsTablePage;
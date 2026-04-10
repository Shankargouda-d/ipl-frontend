import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import InningsBattingTable from "../../components/InningsBattingTable";
import InningsBowlingTable from "../../components/InningsBowlingTable";
import ExtrasForm from "../../components/ExtrasForm";
import { saveInnings } from "../../api/inningsApi";

function blankBattingRow() {
  return { player_id: "", runs: 0, balls: 0, fours: 0, sixes: 0, is_out: 1, dismissal_type: "" };
}

function blankBowlingRow() {
  return { player_id: "", overs: 0, balls: 0, maidens: 0, runs_conceded: 0, wickets: 0 };
}

function ScorecardPage() {
  const [form, setForm] = useState({
    match_id: "",
    innings_no: 1,
    batting_team_id: "",
    bowling_team_id: "",
    wickets: 0,
    overs_bowled: 20,
    balls_bowled: 0,
    is_all_out: false,
    max_overs: 20,
  });

  const [extras, setExtras] = useState({
    wides: 0,
    no_balls: 0,
    byes: 0,
    leg_byes: 0,
    penalty_runs: 0,
  });

  const [batting, setBatting] = useState(Array.from({ length: 11 }, blankBattingRow));
  const [bowling, setBowling] = useState(Array.from({ length: 6 }, blankBowlingRow));
  const [message, setMessage] = useState("");

  const updateBatting = (index, field, value) => {
    const updated = [...batting];
    updated[index][field] = value;
    setBatting(updated);
  };

  const updateBowling = (index, field, value) => {
    const updated = [...bowling];
    updated[index][field] = value;
    setBowling(updated);
  };

  const updateExtras = (field, value) => {
    setExtras({ ...extras, [field]: value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, ...extras, batting, bowling };
    const response = await saveInnings(payload);
    setMessage(response.message);
  };

  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <h2>Scorecard</h2>

        <form className="card form-grid" onSubmit={handleSubmit}>
          <input name="match_id" placeholder="Match ID" value={form.match_id} onChange={handleChange} required />
          <input name="innings_no" type="number" value={form.innings_no} onChange={handleChange} required />
          <input name="batting_team_id" placeholder="Batting Team ID" value={form.batting_team_id} onChange={handleChange} required />
          <input name="bowling_team_id" placeholder="Bowling Team ID" value={form.bowling_team_id} onChange={handleChange} required />
          <input name="wickets" type="number" value={form.wickets} onChange={handleChange} />
          <input name="overs_bowled" type="number" value={form.overs_bowled} onChange={handleChange} />
          <input name="balls_bowled" type="number" value={form.balls_bowled} onChange={handleChange} />
          <label className="checkbox-row">
            <input type="checkbox" name="is_all_out" checked={form.is_all_out} onChange={handleChange} />
            All Out
          </label>

          <ExtrasForm extras={extras} onChange={updateExtras} />
          <InningsBattingTable rows={batting} onChange={updateBatting} />
          <InningsBowlingTable rows={bowling} onChange={updateBowling} />
          <button type="submit">Save Innings</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default ScorecardPage;
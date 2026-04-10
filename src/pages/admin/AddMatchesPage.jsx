import { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import TeamSelect from "../../components/TeamSelect";
import { getTeams } from "../../api/teamsApi";
import { createMatch, getMatches } from "../../api/matchesApi";
import MatchCard from "../../components/MatchCard";

function AddMatchesPage() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState({
    match_no: "",
    team1_id: "",
    team2_id: "",
    match_date: "",
    match_time: "",
    venue: "",
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    const teamsData = await getTeams();
    const matchesData = await getMatches();
    setTeams(teamsData);
    setMatches(matchesData);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMatch(form);
    setForm({
      match_no: "",
      team1_id: "",
      team2_id: "",
      match_date: "",
      match_time: "",
      venue: "",
    });
    const matchesData = await getMatches();
    setMatches(matchesData);
  };

  return (
    <div className="layout-row">
      <AdminSidebar />
      <div className="content">
        <h2>Add Matches</h2>
        <form className="card form-grid" onSubmit={handleSubmit}>
          <input name="match_no" placeholder="Match Number" value={form.match_no} onChange={handleChange} required />
          <TeamSelect label="Team 1" teams={teams} name="team1_id" value={form.team1_id} onChange={handleChange} />
          <TeamSelect label="Team 2" teams={teams} name="team2_id" value={form.team2_id} onChange={handleChange} />
          <input type="date" name="match_date" value={form.match_date} onChange={handleChange} required />
          <input type="time" name="match_time" value={form.match_time} onChange={handleChange} required />
          <input name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} required />
          <button type="submit">Create Match</button>
        </form>

        <div className="grid">
          {matches.map((match) => (
            <MatchCard key={match.match_id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddMatchesPage;
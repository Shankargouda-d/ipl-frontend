import React, { useState, useEffect } from 'react';
import http from '../api/http';
import { getTeamColor } from '../utils/teamColors';
import { Users, Target, Zap, Shield, Trophy } from 'lucide-react';

export default function TeamCompare() {
  const [teams, setTeams] = useState([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    http.get('/teams').then(r => setTeams(r.data));
  }, []);

  useEffect(() => {
    if (team1Id && team2Id) {
      setLoading(true);
      http.get(`/stats/team-compare?team1=${team1Id}&team2=${team2Id}`)
        .then(r => {
          setComparison(r.data);
          setLoading(false);
        });
    } else {
      setComparison(null);
    }
  }, [team1Id, team2Id]);

  const StatRow = ({ label, key1, key2, icon: Icon, isHigherBetter = true }) => {
    const val1 = comparison?.[0]?.[key1] || 0;
    const val2 = comparison?.[1]?.[key1] || 0; // The API returns two objects in an array

    // Find which team is which in the response
    const team1Data = comparison?.find(t => String(t.team_id) === String(team1Id));
    const team2Data = comparison?.find(t => String(t.team_id) === String(team2Id));
    
    const v1 = Number(team1Data?.[key1] || 0);
    const v2 = Number(team2Data?.[key1] || 0);

    const isWinner1 = isHigherBetter ? v1 > v2 : v1 < v2;
    const isWinner2 = isHigherBetter ? v2 > v1 : v2 < v1;

    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Icon size={14} color="#555" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: isWinner1 ? '#fff' : '#888' }}>{v1}</div>
          </div>
          
          <div style={{ width: '120px', height: '6px', background: '#1a1a1a', borderRadius: '3px', display: 'flex', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(v1 / (v1 + v2 || 1)) * 100}%`, 
              height: '100%', 
              background: getTeamColor(team1Data?.short_name),
              opacity: isWinner1 ? 1 : 0.4
            }} />
            <div style={{ 
              width: `${(v2 / (v1 + v2 || 1)) * 100}%`, 
              height: '100%', 
              background: getTeamColor(team2Data?.short_name),
              opacity: isWinner2 ? 1 : 0.4
            }} />
          </div>

          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: isWinner2 ? '#fff' : '#888' }}>{v2}</div>
          </div>
        </div>
      </div>
    );
  };

  const team1 = teams.find(t => String(t.team_id) === String(team1Id));
  const team2 = teams.find(t => String(t.team_id) === String(team2Id));

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', justifyContent: 'center', alignItems: 'center' }}>
        <select 
          value={team1Id} 
          onChange={e => setTeam1Id(e.target.value)}
          style={selectStyle(getTeamColor(team1?.short_name))}
        >
          <option value="">Select Team 1</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#333' }}>VS</div>

        <select 
          value={team2Id} 
          onChange={e => setTeam2Id(e.target.value)}
          style={selectStyle(getTeamColor(team2?.short_name))}
        >
          <option value="">Select Team 2</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
      </div>

      {!comparison && !loading && (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#111', borderRadius: '24px', border: '1px dashed #222' }}>
          <Users size={48} color="#222" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#444', margin: 0 }}>Choose two teams to compare head-to-head statistics</h3>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>Analyzing data...</div>
      )}

      {comparison && !loading && (
        <div style={{ 
          background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)', 
          borderRadius: '24px', 
          padding: '40px 24px',
          border: '1px solid #1f1f1f',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, color: getTeamColor(team1?.short_name) }}>{team1?.short_name}</h2>
              <p style={{ color: '#666', margin: '4px 0 0', fontSize: '13px' }}>{team1?.team_name}</p>
            </div>
            
            <div style={{ padding: '0 40px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#555' }}>VS</span>
              </div>
            </div>

            <div style={{ flex: 1, textAlign: 'left' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, color: getTeamColor(team2?.short_name) }}>{team2?.short_name}</h2>
              <p style={{ color: '#666', margin: '4px 0 0', fontSize: '13px' }}>{team2?.team_name}</p>
            </div>
          </div>

          <StatRow label="Matches Won" key1="matches_won" icon={Trophy} />
          <StatRow label="Avg Runs / Match" key1="avg_runs" icon={Zap} />
          <StatRow label="Total Runs" key1="total_runs" icon={Target} />
          <StatRow label="Total Sixes" key1="total_sixes" icon={Zap} />
          <StatRow label="Total Wickets" key1="total_wickets" icon={Shield} />
        </div>
      )}
    </div>
  );
}

const selectStyle = (color) => ({
  background: '#1a1a1a',
  border: color ? `1px solid ${color}88` : '1px solid #2a2a2a',
  color: '#fff',
  padding: '12px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  outline: 'none',
  cursor: 'pointer',
  minWidth: '200px'
});

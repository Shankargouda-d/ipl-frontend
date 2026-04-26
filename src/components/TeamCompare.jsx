import React, { useState, useEffect } from 'react';
import http from '../api/http';
import { getTeamColor } from '../utils/teamColors';
import { Users, Target, Zap, Shield, Trophy } from 'lucide-react';
import { 
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function TeamCompare() {
  const [teams, setTeams] = useState([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [matchComparison, setMatchComparison] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    http.get('/teams').then(r => setTeams(r.data));
  }, []);

  useEffect(() => {
    if (team1Id && team2Id) {
      setLoading(true);
      Promise.all([
        http.get(`/stats/team-compare?team1=${team1Id}&team2=${team2Id}`),
        http.get(`/stats/team-compare-matches?team1=${team1Id}&team2=${team2Id}`)
      ]).then(([compRes, matchRes]) => {
        setComparison(compRes.data);
        setMatchComparison(matchRes.data);
        setLoading(false);
      }).catch(e => {
        console.error(e);
        setLoading(false);
      });
    } else {
      setComparison(null);
      setMatchComparison([]);
    }
  }, [team1Id, team2Id]);

  const team1 = teams.find(t => String(t.team_id) === String(team1Id));
  const team2 = teams.find(t => String(t.team_id) === String(team2Id));

  const team1Color = getTeamColor(team1?.short_name);
  const team2Color = getTeamColor(team2?.short_name);

  // Overall Stats Processing
  const team1Data = comparison?.find(t => String(t.team_id) === String(team1Id)) || {};
  const team2Data = comparison?.find(t => String(t.team_id) === String(team2Id)) || {};

  // Donut Chart Data (Runs Share)
  const runShareData = [
    { name: team1?.short_name, value: Number(team1Data.total_runs || 0), color: team1Color },
    { name: team2?.short_name, value: Number(team2Data.total_runs || 0), color: team2Color }
  ];

  // Boundaries Data
  const boundariesData1 = [
    { name: '4s', value: Number(team1Data.total_fours || 0) * 4, fill: `${team1Color}bb` },
    { name: '6s', value: Number(team1Data.total_sixes || 0) * 6, fill: team1Color }
  ];
  const boundariesData2 = [
    { name: '4s', value: Number(team2Data.total_fours || 0) * 4, fill: `${team2Color}bb` },
    { name: '6s', value: Number(team2Data.total_sixes || 0) * 6, fill: team2Color }
  ];

  // Match-by-Match Data Processing
  const team1Matches = matchComparison.filter(m => String(m.team_id) === String(team1Id));
  const team2Matches = matchComparison.filter(m => String(m.team_id) === String(team2Id));
  
  const timelineData = [];
  const maxMatches = Math.max(team1Matches.length, team2Matches.length);
  for (let i = 0; i < maxMatches; i++) {
    timelineData.push({
      name: `M${i + 1}`,
      [team1?.short_name]: team1Matches[i]?.runs || null,
      [team2?.short_name]: team2Matches[i]?.runs || null,
      [`${team1?.short_name} W`]: team1Matches[i]?.wickets_taken || 0,
      [`${team2?.short_name} W`]: team2Matches[i]?.wickets_taken || 0,
    });
  }

  // Custom Stat Row for aggregate data
  const StatRow = ({ label, key1, icon: Icon, isHigherBetter = true }) => {
    const v1 = Number(team1Data[key1] || 0);
    const v2 = Number(team2Data[key1] || 0);

    const isWinner1 = isHigherBetter ? v1 > v2 : v1 < v2;
    const isWinner2 = isHigherBetter ? v2 > v1 : v2 < v1;

    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Icon size={14} color="#aaa" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ 
              fontSize: '22px', fontWeight: 900, 
              color: isWinner1 ? team1Color : '#fff',
              textShadow: isWinner1 ? `0 0 12px ${team1Color}88` : 'none',
              opacity: isWinner1 ? 1 : 0.6
            }}>{v1}</div>
          </div>
          
          <div style={{ width: '140px', height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', display: 'flex', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{ 
              width: `${(v1 / (v1 + v2 || 1)) * 100}%`, 
              height: '100%', 
              background: `linear-gradient(90deg, ${team1Color}55, ${team1Color})`,
              boxShadow: isWinner1 ? `0 0 10px ${team1Color}` : 'none',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
            <div style={{ 
              width: `${(v2 / (v1 + v2 || 1)) * 100}%`, 
              height: '100%', 
              background: `linear-gradient(270deg, ${team2Color}55, ${team2Color})`,
              boxShadow: isWinner2 ? `0 0 10px ${team2Color}` : 'none',
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ 
              fontSize: '22px', fontWeight: 900, 
              color: isWinner2 ? team2Color : '#fff',
              textShadow: isWinner2 ? `0 0 12px ${team2Color}88` : 'none',
              opacity: isWinner2 ? 1 : 0.6
            }}>{v2}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header Selectors */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <select 
          value={team1Id} 
          onChange={e => setTeam1Id(e.target.value)}
          style={{ ...selectStyle, border: team1Color ? `1px solid ${team1Color}aa` : '1px solid rgba(255,255,255,0.2)', boxShadow: team1Color ? `0 0 15px ${team1Color}33` : 'none' }}
        >
          <option value="">Select Team 1</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
          VS
        </div>

        <select 
          value={team2Id} 
          onChange={e => setTeam2Id(e.target.value)}
          style={{ ...selectStyle, border: team2Color ? `1px solid ${team2Color}aa` : '1px solid rgba(255,255,255,0.2)', boxShadow: team2Color ? `0 0 15px ${team2Color}33` : 'none' }}
        >
          <option value="">Select Team 2</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
      </div>

      {!comparison && !loading && (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(17,17,17,0.4)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Users size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#888', margin: 0, fontWeight: 500 }}>Select two teams to unlock advanced analytics</h3>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#888', animation: 'pulse 1.5s infinite' }}>
          Crunching the data...
        </div>
      )}

      {comparison && !loading && (
        <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          
          {/* Main Glassmorphism Card */}
          <div style={{ 
            background: 'rgba(15, 15, 15, 0.7)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px', 
            padding: '40px 24px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: team1Color, filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: team2Color, filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', alignItems: 'center' }}>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <h2 style={{ fontSize: '42px', fontWeight: 900, margin: 0, color: team1Color, textShadow: `0 0 20px ${team1Color}88`, letterSpacing: '-1px' }}>{team1?.short_name}</h2>
                  <p style={{ color: '#aaa', margin: '4px 0 0', fontSize: '13px', fontWeight: 600 }}>{team1?.team_name}</p>
                </div>
                
                <div style={{ padding: '0 40px' }}>
                  <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h2 style={{ fontSize: '42px', fontWeight: 900, margin: 0, color: team2Color, textShadow: `0 0 20px ${team2Color}88`, letterSpacing: '-1px' }}>{team2?.short_name}</h2>
                  <p style={{ color: '#aaa', margin: '4px 0 0', fontSize: '13px', fontWeight: 600 }}>{team2?.team_name}</p>
                </div>
              </div>

              {/* Head to Head Aggregate Stats */}
              <StatRow label="Matches Won" key1="matches_won" icon={Trophy} />
              <StatRow label="Avg Runs / Match" key1="avg_runs" icon={Zap} />
              <StatRow label="Total Wickets" key1="total_wickets" icon={Shield} />
              <StatRow label="Total Boundaries (Runs)" key1="total_runs" icon={Target} />
            </div>
          </div>

          {/* Graphical Visualizations Section */}
          <h3 style={{ marginTop: '50px', marginBottom: '24px', fontSize: '20px', color: '#fff', borderLeft: '4px solid #d85a30', paddingLeft: '12px' }}>
            Visual Insights
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Run Share Donut */}
            <div style={chartCardStyle}>
              <h4 style={chartTitleStyle}>Total Runs Distribution</h4>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={runShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {runShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(10,10,10,0.9)', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Boundaries Fours vs Sixes */}
            <div style={chartCardStyle}>
              <h4 style={chartTitleStyle}>Boundaries Breakdown (Runs)</h4>
              <div style={{ display: 'flex', height: 250 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ textAlign: 'center', fontSize: 12, color: team1Color, margin: 0 }}>{team1?.short_name}</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={boundariesData1} cx="50%" cy="50%" outerRadius={70} dataKey="value" stroke="rgba(0,0,0,0.2)">
                        {boundariesData1.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(10,10,10,0.9)', border: 'none', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ textAlign: 'center', fontSize: 12, color: team2Color, margin: 0 }}>{team2?.short_name}</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={boundariesData2} cx="50%" cy="50%" outerRadius={70} dataKey="value" stroke="rgba(0,0,0,0.2)">
                        {boundariesData2.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(10,10,10,0.9)', border: 'none', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: '#888' }}>Inner pie = 4s | Outer pie = 6s</div>
            </div>

            {/* Match-by-Match Runs Grid */}
            <div style={{ ...chartCardStyle, gridColumn: '1 / -1' }}>
              <h4 style={chartTitleStyle}>Match-by-Match Form (Runs Scored)</h4>
              <div style={{ height: 300, marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15,15,15,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} 
                      itemStyle={{ fontWeight: 600 }}
                    />
                    <Legend iconType="plainline" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey={team1?.short_name} stroke={team1Color} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: team1Color }} dot={{ r: 4, fill: '#111', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey={team2?.short_name} stroke={team2Color} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0, fill: team2Color }} dot={{ r: 4, fill: '#111', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wickets Match-by-Match */}
            <div style={{ ...chartCardStyle, gridColumn: '1 / -1' }}>
              <h4 style={chartTitleStyle}>Wickets Taken Per Match</h4>
              <div style={{ height: 300, marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ background: 'rgba(15,15,15,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey={`${team1?.short_name} W`} name={`${team1?.short_name} Wickets`} fill={team1Color} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey={`${team2?.short_name} W`} name={`${team2?.short_name} Wickets`} fill={team2Color} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Injecting CSS Animation once */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

const selectStyle = {
  background: 'rgba(20,20,20,0.8)',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  padding: '14px 24px',
  borderRadius: '16px',
  fontSize: '15px',
  fontWeight: 700,
  outline: 'none',
  cursor: 'pointer',
  minWidth: '220px',
  transition: 'all 0.3s ease',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px top 50%',
  backgroundSize: '10px auto',
};

const chartCardStyle = {
  background: 'rgba(15, 15, 15, 0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
};

const chartTitleStyle = {
  marginTop: 0,
  marginBottom: '20px',
  fontSize: '15px',
  color: '#aaa',
  textAlign: 'center',
  fontWeight: 600,
  letterSpacing: '0.5px'
};

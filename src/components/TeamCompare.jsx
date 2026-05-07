import React, { useState, useEffect } from 'react';
import http from '../api/http';
import { getTeamColor } from '../utils/teamColors';
import { Users, Target, Zap, Shield, Trophy } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function TeamCompare() {
  const [teams, setTeams] = useState([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    http.get('/teams').then(r => setTeams(r.data));
    http.get('/points').then(r => setPoints(r.data));
  }, []);

  useEffect(() => {
    if (team1Id && team2Id) {
      setLoading(true);
      http.get(`/stats/team-compare?team1=${team1Id}&team2=${team2Id}`)
        .then(res => {
          setComparison(res.data);
          setLoading(false);
        }).catch(e => {
          console.error(e);
          setLoading(false);
        });
    } else {
      setComparison(null);
    }
  }, [team1Id, team2Id]);

  const team1 = teams.find(t => String(t.team_id) === String(team1Id));
  const team2 = teams.find(t => String(t.team_id) === String(team2Id));

  const team1Color = getTeamColor(team1?.short_name);
  const team2Color = getTeamColor(team2?.short_name);

  // Overall Stats Processing
  const team1Data = comparison?.find(t => String(t.team_id) === String(team1Id)) || {};
  const team2Data = comparison?.find(t => String(t.team_id) === String(team2Id)) || {};

  const getQualificationChance = (winsNeeded, matchesLeft) => {
    if (winsNeeded <= 0) return 100;
    if (winsNeeded > matchesLeft) return 0;
    let favorableOutcomes = 0;
    const totalOutcomes = Math.pow(2, matchesLeft);
    const nCr = (n, r) => {
      if (r === 0 || n === r) return 1;
      let res = 1;
      for (let i = 1; i <= r; i++) res = res * (n - i + 1) / i;
      return res;
    };
    for (let i = winsNeeded; i <= matchesLeft; i++) favorableOutcomes += nCr(matchesLeft, i);
    return Math.round((favorableOutcomes / totalOutcomes) * 100);
  };

  const t1Points = points.find(p => String(p.team_id) === String(team1Id)) || {};
  const t2Points = points.find(p => String(p.team_id) === String(team2Id)) || {};
  const t1Pos = points.findIndex(p => String(p.team_id) === String(team1Id)) + 1 || '-';
  const t2Pos = points.findIndex(p => String(p.team_id) === String(team2Id)) + 1 || '-';
  const t1Chance = getQualificationChance(t1Points.wins_needed_to_16, t1Points.matches_left);
  const t2Chance = getQualificationChance(t2Points.wins_needed_to_16, t2Points.matches_left);


  // 4s Comparison (percentage pie: team1 vs team2)
  const t1Fours = Number(team1Data.total_fours || 0);
  const t2Fours = Number(team2Data.total_fours || 0);
  const foursData = [
    { name: team1?.short_name, value: t1Fours, color: team1Color },
    { name: team2?.short_name, value: t2Fours, color: team2Color }
  ];

  // 6s Comparison (percentage pie: team1 vs team2)
  const t1Sixes = Number(team1Data.total_sixes || 0);
  const t2Sixes = Number(team2Data.total_sixes || 0);
  const sixesData = [
    { name: team1?.short_name, value: t1Sixes, color: team1Color },
    { name: team2?.short_name, value: t2Sixes, color: team2Color }
  ];

  // Custom label renderer for percentage inside pie
  const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent === 0) return null;
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


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
              <StatRow label="Matches Played" key1="matches_played" icon={Trophy} />
              <StatRow label="Matches Won" key1="matches_won" icon={Trophy} />
              <StatRow label="Avg Runs / Match" key1="avg_runs" icon={Zap} />
              <StatRow label="Total Wickets" key1="total_wickets" icon={Shield} />
              <StatRow label="Total Boundaries (Runs)" key1="total_runs" icon={Target} />
            </div>
          </div>

          {/* Tournament Context (Points Table Info) */}
          <h3 style={{ marginTop: '40px', marginBottom: '20px', fontSize: '20px', color: '#fff', borderLeft: '4px solid #3b82f6', paddingLeft: '12px' }}>
            Tournament Context
          </h3>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              { t: team1, p: t1Points, pos: t1Pos, chance: t1Chance, color: team1Color },
              { t: team2, p: t2Points, pos: t2Pos, chance: t2Chance, color: team2Color }
            ].map(({ t, p, pos, chance, color }, idx) => (
              <div key={idx} style={{ ...chartCardStyle, flex: '1 1 280px', borderLeft: `4px solid ${color}` }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                  {t?.team_name}
                  <span style={{ fontSize: '14px', color: '#888', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px' }}>Rank #{pos}</span>
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #2a2a2a', paddingBottom: '8px' }}>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Matches Played</span>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>{p.played || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #2a2a2a', paddingBottom: '8px' }}>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Wins needed to qualify</span>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: p.wins_needed_to_16 > (p.matches_left || 0) ? '#e24b4a' : '#fff' }}>
                    {p.wins_needed_to_16 > 0 ? `${p.wins_needed_to_16} (of ${p.matches_left} left)` : '0 (Qualified)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Playoff Chance</span>
                  <span style={{ fontWeight: 900, fontSize: '18px', color: chance >= 50 ? '#639922' : chance > 0 ? '#f39c12' : '#e24b4a' }}>
                    {chance}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Boundaries Comparison Section */}
          <h3 style={{ marginTop: '50px', marginBottom: '24px', fontSize: '20px', color: '#fff', borderLeft: '4px solid #d85a30', paddingLeft: '12px' }}>
            Boundaries Comparison
          </h3>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Fours Comparison */}
            <div style={{ ...chartCardStyle, flex: '1 1 280px' }}>
              <h4 style={chartTitleStyle}>Fours (4s) Share</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: team1Color }}>{t1Fours}</span>
                <span style={{ fontSize: '13px', color: '#555', fontWeight: 700 }}>vs</span>
                <span style={{ fontSize: '28px', fontWeight: 900, color: team2Color }}>{t2Fours}</span>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={foursData} cx="50%" cy="50%" 
                      innerRadius={55} outerRadius={85} 
                      paddingAngle={4} dataKey="value" stroke="none"
                      label={renderPercentLabel}
                      labelLine={false}
                    >
                      {foursData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(10,10,10,0.95)', border: '1px solid #333', borderRadius: '10px' }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`${value} fours`, name]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sixes Comparison */}
            <div style={{ ...chartCardStyle, flex: '1 1 280px' }}>
              <h4 style={chartTitleStyle}>Sixes (6s) Share</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: team1Color }}>{t1Sixes}</span>
                <span style={{ fontSize: '13px', color: '#555', fontWeight: 700 }}>vs</span>
                <span style={{ fontSize: '28px', fontWeight: 900, color: team2Color }}>{t2Sixes}</span>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={sixesData} cx="50%" cy="50%" 
                      innerRadius={55} outerRadius={85} 
                      paddingAngle={4} dataKey="value" stroke="none"
                      label={renderPercentLabel}
                      labelLine={false}
                    >
                      {sixesData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(10,10,10,0.95)', border: '1px solid #333', borderRadius: '10px' }} 
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`${value} sixes`, name]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
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

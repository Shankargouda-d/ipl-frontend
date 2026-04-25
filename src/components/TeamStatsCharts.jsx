import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getTeamColor } from '../utils/teamColors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = getTeamColor(data.short_name);
    return (
      <div style={{
        backgroundColor: '#111',
        border: `1px solid ${color}88`,
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 4 }}>{data.team_name}</p>
        <p style={{ margin: 0, color: color, fontWeight: 700, fontSize: 18 }}>
          {payload[0].value.toLocaleString()} <span style={{ fontSize: 11, color: '#888' }}>{payload[0].name.toUpperCase()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const TeamStatSection = ({ title, data, dataKey, icon, color }) => {
  return (
    <div style={{
      background: '#111',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid #1f1f1f',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{title}</h3>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis 
              dataKey="short_name" 
              stroke="#666" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#666" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} name={title}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getTeamColor(entry.short_name)} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function TeamStatsCharts({ teamsData }) {
  if (!teamsData || teamsData.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
      No stats available yet.
    </div>
  );

  return (
    <div>
      <TeamStatSection 
        title="Total Runs" 
        data={[...teamsData].sort((a,b) => b.total_runs - a.total_runs)} 
        dataKey="total_runs" 
        icon="🏏"
        color="#d85a30"
      />
      <TeamStatSection 
        title="Total Sixes" 
        data={[...teamsData].sort((a,b) => b.total_sixes - a.total_sixes)} 
        dataKey="total_sixes" 
        icon="💥"
        color="#22c55e"
      />
      <TeamStatSection 
        title="Total Wickets" 
        data={[...teamsData].sort((a,b) => b.total_wickets - a.total_wickets)} 
        dataKey="total_wickets" 
        icon="🟣"
        color="#7F77DD"
      />
    </div>
  );
}

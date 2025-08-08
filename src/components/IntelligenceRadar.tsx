import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

interface IntelligenceRadarProps {
  scores: Record<string, number>;
  className?: string;
}

const IntelligenceRadar: React.FC<IntelligenceRadarProps> = ({ scores, className }) => {
  const data = Object.entries(scores || {}).map(([name, score]) => ({
    name,
    value: Math.round(((score || 0) as number) * 20),
  }));

  if (!data.length) return null;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="60%">
          <PolarGrid stroke="hsl(var(--muted-foreground) / 0.4)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            domain={[0, 100]}
            angle={90}
          />
          <Radar
            name="Strength"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.25)"
            fillOpacity={1}
          />
          <Tooltip formatter={(value: number) => `${value}%`} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IntelligenceRadar;

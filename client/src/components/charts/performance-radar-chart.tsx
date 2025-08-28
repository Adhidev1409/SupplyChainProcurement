import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { type SupplierWithCalculated } from "@shared/schema";

interface PerformanceRadarProps {
  suppliers: SupplierWithCalculated[];
}

export default function PerformanceRadarChart({ suppliers }: PerformanceRadarProps) {
  if (suppliers.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  // Calculate average performance metrics
  const avgCarbonScore = suppliers.reduce((sum, s) => {
    // Lower carbon footprint = higher score (inverted)
    const score = Math.max(0, 100 - (s.carbonFootprint / 50));
    return sum + Math.min(100, score);
  }, 0) / suppliers.length;

  const avgWaterScore = suppliers.reduce((sum, s) => {
    // Lower water usage = higher score (inverted)  
    const score = Math.max(0, 100 - (s.waterUsage / 30));
    return sum + Math.min(100, score);
  }, 0) / suppliers.length;

  const avgRecyclingScore = suppliers.reduce((sum, s) => sum + (s.recyclingPolicy ? 100 : 0), 0) / suppliers.length;
  const avgCertificationScore = suppliers.reduce((sum, s) => sum + (s.ISO14001 ? 100 : 0), 0) / suppliers.length;
  const avgRiskScore = suppliers.reduce((sum, s) => sum + (100 - s.riskScore), 0) / suppliers.length;

  const data = [
    { metric: 'Carbon Footprint', value: Math.round(avgCarbonScore) },
    { metric: 'Water Usage', value: Math.round(avgWaterScore) },
    { metric: 'Recycling Policy', value: Math.round(avgRecyclingScore) },
    { metric: 'Certifications', value: Math.round(avgCertificationScore) },
    { metric: 'Risk Management', value: Math.round(avgRiskScore) },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

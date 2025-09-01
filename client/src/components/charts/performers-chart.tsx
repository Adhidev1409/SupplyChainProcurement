import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type SupplierWithCalculated } from "@shared/schema";

interface PerformersChartProps {
  suppliers: SupplierWithCalculated[];
}

export default function PerformersChart({ suppliers }: PerformersChartProps) {
  if (suppliers.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  // Sort all suppliers by sustainability score (highest first)
  const chartData = [...suppliers]
    .map(supplier => ({
      name: supplier.name.length > 15 ? supplier.name.substring(0, 15) + '...' : supplier.name,
      score: supplier.sustainabilityScore,
      fill: supplier.sustainabilityScore >= 75 ? '#10b981' : 
            supplier.sustainabilityScore >= 50 ? '#f59e0b' : '#ef4444'
    }));

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="score" isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

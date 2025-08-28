import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type SupplierWithCalculated } from "@shared/schema";

interface PerformersChartProps {
  suppliers: SupplierWithCalculated[];
}

export default function PerformersChart({ suppliers }: PerformersChartProps) {
  if (suppliers.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  // Sort suppliers by sustainability score
  const sorted = [...suppliers].sort((a, b) => a.sustainabilityScore - b.sustainabilityScore);
  
  // Get top 5 and bottom 5
  const bottom5 = sorted.slice(0, 5);
  const top5 = sorted.slice(-5);
  
  // Combine and format for chart
  const chartData = [...bottom5, ...top5].map(supplier => ({
    name: supplier.name.length > 15 ? supplier.name.substring(0, 15) + '...' : supplier.name,
    score: supplier.sustainabilityScore,
    fill: supplier.sustainabilityScore >= 80 ? '#10b981' : 
          supplier.sustainabilityScore >= 60 ? '#f59e0b' : '#ef4444'
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

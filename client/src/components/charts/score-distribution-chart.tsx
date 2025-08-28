import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type SupplierWithCalculated } from "@shared/schema";

interface ScoreDistributionProps {
  suppliers: SupplierWithCalculated[];
}

export default function ScoreDistributionChart({ suppliers }: ScoreDistributionProps) {
  const buckets = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };

  suppliers.forEach(supplier => {
    const score = supplier.sustainabilityScore;
    if (score <= 20) buckets['0-20']++;
    else if (score <= 40) buckets['21-40']++;
    else if (score <= 60) buckets['41-60']++;
    else if (score <= 80) buckets['61-80']++;
    else buckets['81-100']++;
  });

  const data = Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};

interface RiskDistributionProps {
  data?: {
    low: number;
    medium: number;
    high: number;
  };
}

export default function RiskDistributionChart({ data }: RiskDistributionProps) {
  if (!data) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  const chartData = [
    { name: 'Low Risk', value: data.low, color: COLORS.low },
    { name: 'Medium Risk', value: data.medium, color: COLORS.medium },
    { name: 'High Risk', value: data.high, color: COLORS.high },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

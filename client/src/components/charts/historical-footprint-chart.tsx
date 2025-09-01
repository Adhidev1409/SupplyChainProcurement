import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type SupplierWithCalculated } from "@shared/schema";

interface HistoricalFootprintProps {
  supplier: SupplierWithCalculated;
}

export default function HistoricalFootprintChart({ supplier }: HistoricalFootprintProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate mock historical data based on current carbon footprint
  const baseFootprint = supplier.carbonFootprint;
  const data = months.map((month, index) => ({
    month,
    footprint: Math.round(baseFootprint + (Math.random() - 0.5) * baseFootprint * 0.2),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="footprint" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

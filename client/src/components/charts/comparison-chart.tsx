import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { type SupplierWithCalculated } from "@shared/schema";

interface ComparisonChartProps {
  currentSupplier: SupplierWithCalculated;
  prospectiveSupplier: SupplierWithCalculated;
  orderQuantity: number;
}

export default function ComparisonChart({ currentSupplier, prospectiveSupplier, orderQuantity }: ComparisonChartProps) {
  // Calculate projected impact based on order quantity
  const currentCarbonImpact = (currentSupplier.carbonFootprint * orderQuantity) / 1000;
  const prospectiveCarbonImpact = (prospectiveSupplier.carbonFootprint * orderQuantity) / 1000;
  
  const currentWaterImpact = (currentSupplier.waterUsage * orderQuantity) / 100;
  const prospectiveWaterImpact = (prospectiveSupplier.waterUsage * orderQuantity) / 100;

  const data = [
    {
      metric: 'Carbon Footprint (tons)',
      current: Math.round(currentCarbonImpact),
      prospective: Math.round(prospectiveCarbonImpact),
    },
    {
      metric: 'Water Usage (L)',
      current: Math.round(currentWaterImpact),
      prospective: Math.round(prospectiveWaterImpact),
    }
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="metric" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="current" 
            fill="hsl(var(--destructive))" 
            name="Current Supplier"
          />
          <Bar 
            dataKey="prospective" 
            fill="hsl(var(--accent))" 
            name="Prospective Supplier"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

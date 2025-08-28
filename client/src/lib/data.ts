import { type SupplierWithCalculated } from "@shared/schema";

export const SAMPLE_SUPPLIERS: SupplierWithCalculated[] = [
  {
    id: "1",
    name: "GreenSupply Co.",
    carbonFootprint: 1245,
    waterUsage: 780,
    recyclingPolicy: true,
    ISO14001: true,
    riskScore: 15,
    sustainabilityScore: 85,
    riskLevel: "Low",
    historicalCarbon: [1400, 1350, 1300, 1280, 1245, 1200, 1180, 1160, 1140, 1120, 1100, 1080]
  },
  {
    id: "2",
    name: "EcoTech Industries",
    carbonFootprint: 3890,
    waterUsage: 2100,
    recyclingPolicy: false,
    ISO14001: false,
    riskScore: 75,
    sustainabilityScore: 45,
    riskLevel: "High",
    historicalCarbon: [4200, 4150, 4100, 4050, 4000, 3950, 3900, 3890, 3880, 3870, 3860, 3850]
  }
];

export const generateRecommendations = (supplier: SupplierWithCalculated) => {
  const recommendations = [];
  
  if (supplier.carbonFootprint > 2000) {
    recommendations.push({
      type: "Carbon Reduction Strategy",
      color: "accent",
      title: "High Carbon Footprint Detected",
      description: `Your carbon footprint of ${supplier.carbonFootprint} tons is above industry standards. Consider implementing renewable energy sources and energy efficiency measures to reduce emissions by 20-30%.`
    });
  }
  
  if (supplier.waterUsage > 1500) {
    recommendations.push({
      type: "Water Conservation Initiative",
      color: "primary",
      title: "Water Usage Optimization",
      description: `With ${supplier.waterUsage}L water usage, implementing water recycling systems and monitoring could reduce consumption by 15-25%.`
    });
  }
  
  if (!supplier.recyclingPolicy) {
    recommendations.push({
      type: "Waste Management Enhancement",
      color: "secondary",
      title: "Implement Recycling Program",
      description: "Establishing a comprehensive recycling program could improve your sustainability score by 8-12 points and reduce waste disposal costs."
    });
  }
  
  if (!supplier.ISO14001) {
    recommendations.push({
      type: "Certification Opportunity",
      color: "primary",
      title: "ISO 14001 Certification",
      description: "Obtaining ISO 14001 certification would demonstrate environmental management commitment and could boost your sustainability score significantly."
    });
  }
  
  if (supplier.riskScore > 50) {
    recommendations.push({
      type: "Risk Management",
      color: "destructive",
      title: "Risk Mitigation Required",
      description: "Your risk score indicates potential supply chain vulnerabilities. Consider diversifying suppliers and implementing risk monitoring systems."
    });
  }

  // Always provide at least one positive recommendation
  if (recommendations.length === 0 || supplier.sustainabilityScore > 80) {
    recommendations.push({
      type: "Sustainability Leadership",
      color: "accent",
      title: "Maintain Excellence",
      description: "Your sustainability performance is excellent. Consider sharing best practices with other suppliers and exploring additional green initiatives to lead by example."
    });
  }
  
  return recommendations.slice(0, 3); // Return max 3 recommendations
};

export const calculateSimulation = (currentSupplierId: string, prospectiveSupplierId: string, quantity: number, suppliers: SupplierWithCalculated[]) => {
  const currentSupplier = suppliers.find(s => s.id === currentSupplierId);
  const prospectiveSupplier = suppliers.find(s => s.id === prospectiveSupplierId);
  
  if (!currentSupplier || !prospectiveSupplier || !quantity) {
    return null;
  }
  
  const carbonSavings = ((currentSupplier.carbonFootprint - prospectiveSupplier.carbonFootprint) * quantity) / 1000;
  const waterSavings = ((currentSupplier.waterUsage - prospectiveSupplier.waterUsage) * quantity) / 100;
  const costImpact = (prospectiveSupplier.sustainabilityScore - currentSupplier.sustainabilityScore) * quantity * 10;
  
  return {
    currentSupplier,
    prospectiveSupplier,
    carbonSavings: Math.round(carbonSavings),
    waterSavings: Math.round(waterSavings),
    costImpact: Math.round(costImpact),
  };
};

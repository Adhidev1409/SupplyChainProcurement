import { type SupplierWithCalculated } from "@shared/schema";

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
  
  if (supplier.wasteGeneration > 15) {
    recommendations.push({
      type: "Waste Management Enhancement",
      color: "secondary",
      title: "Reduce Waste Generation",
      description: `With ${supplier.wasteGeneration} tons of waste generation, implementing waste reduction and recycling programs could improve your sustainability score by 8-12 points.`
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
  
  if (supplier.riskLevel === 'High') {
    recommendations.push({
      type: "Risk Management",
      color: "destructive",
      title: "Risk Mitigation Required",
      description: "Your high risk level indicates potential supply chain vulnerabilities. Consider implementing risk monitoring systems and improving regulatory compliance."
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

export const calculateSimulation = (
  currentSupplierId: number,
  prospectiveSupplierId: number,
  quantity: number,
  suppliers: SupplierWithCalculated[],
  years: number,
  riskTolerance: "low" | "medium" | "high"
) => {
  const currentSupplier = suppliers.find(s => s.id === currentSupplierId);
  const prospectiveSupplier = suppliers.find(s => s.id === prospectiveSupplierId);

  if (!currentSupplier || !prospectiveSupplier || !quantity) {
    return null;
  }

  // Base diffs per unit
  const carbonDiffPerUnit = currentSupplier.carbonFootprint - prospectiveSupplier.carbonFootprint;
  const waterDiffPerUnit = currentSupplier.waterUsage - prospectiveSupplier.waterUsage;
  // Use direct cost difference per unit (transport cost as proxy for direct cost)
  const costDiffPerUnit = prospectiveSupplier.transportCostPerUnit - currentSupplier.transportCostPerUnit;

  // Adjust for contract length (scale impact over time)
  const timeFactor = years;

  // Adjust for risk tolerance (switch aggressiveness)
  let riskMultiplier = 1;
  if (riskTolerance === "low") riskMultiplier = 0.7;     // conservative projection
  if (riskTolerance === "medium") riskMultiplier = 1;    // balanced
  if (riskTolerance === "high") riskMultiplier = 1.3;    // aggressive expansion

  // Final projections
  const carbonSavings = Math.round((carbonDiffPerUnit * quantity * timeFactor * riskMultiplier) / 1000);
  const waterSavings = Math.round((waterDiffPerUnit * quantity * timeFactor * riskMultiplier) / 100);
  const costImpact = Math.round(costDiffPerUnit * quantity * timeFactor * riskMultiplier);

  return {
    currentSupplier,
    prospectiveSupplier,
    carbonSavings,
    waterSavings,
    costImpact,
    years,
    riskTolerance
  };
};
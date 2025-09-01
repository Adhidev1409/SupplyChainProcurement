import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ComparisonChart from "@/components/charts/comparison-chart";
import { calculateSimulation } from "@/lib/data";
import { type SupplierWithCalculated } from "@shared/schema";
import { Calculator, TrendingDown, TrendingUp, Zap } from "lucide-react";

export default function AdminSimulationPage() {
  const [currentSupplierId, setCurrentSupplierId] = useState("");
  const [prospectiveSupplierId, setProspectiveSupplierId] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [contractLength, setContractLength] = useState("2");
  const [riskTolerance, setRiskTolerance] = useState("medium");

  const { data: suppliers = [], isLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  const runSimulation = () => {
    if (!currentSupplierId || !prospectiveSupplierId || !orderQuantity) {
      return;
    }

    const result = calculateSimulation(
      parseInt(currentSupplierId),
      parseInt(prospectiveSupplierId),
      parseInt(orderQuantity),
      suppliers,
      parseInt(contractLength),
      riskTolerance as "low" | "medium" | "high"
    );

    setSimulationResult(result);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading simulation...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="simulation-title">
            Supply Chain Impact Simulator
          </h1>
          <p className="text-gray-600">Compare environmental impact between current and prospective suppliers</p>
        </div>

        {/* Simulation Controls */}
        <Card className="shadow-lg mb-8" data-testid="simulation-controls">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-blue-500" />
              Simulation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Supplier</Label>
                <Select value={currentSupplierId} onValueChange={setCurrentSupplierId}>
                  <SelectTrigger data-testid="select-current-supplier" className="mt-1">
                    <SelectValue placeholder="Select Current Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Prospective Supplier</Label>
                <Select value={prospectiveSupplierId} onValueChange={setProspectiveSupplierId}>
                  <SelectTrigger data-testid="select-prospective-supplier" className="mt-1">
                    <SelectValue placeholder="Select Prospective Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Additional Parameters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="order-quantity" className="text-sm font-medium text-gray-700">Order Quantity (units)</Label>
                <Input
                  id="order-quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  data-testid="input-order-quantity"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contract-length" className="text-sm font-medium text-gray-700">Contract Length (years)</Label>
                <Select value={contractLength} onValueChange={setContractLength}>
                  <SelectTrigger data-testid="select-contract-length" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Risk Tolerance</Label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                  <SelectTrigger data-testid="select-risk-tolerance" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Conservative</SelectItem>
                    <SelectItem value="medium">Balanced</SelectItem>
                    <SelectItem value="high">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6">
              <Button 
                onClick={runSimulation} 
                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700"
                disabled={!currentSupplierId || !prospectiveSupplierId || !orderQuantity}
                data-testid="button-run-simulation"
              >
                <Zap className="h-4 w-4 mr-2" />
                Run Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Results */}
        {simulationResult && (
          <div className="space-y-8" data-testid="simulation-results">
            {/* Impact Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg" data-testid="card-environmental-savings">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-green-500" />
                    Projected Environmental Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Carbon Footprint Reduction</span>
                      <span className={`text-lg font-bold ${simulationResult.carbonSavings > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-carbon-savings">
                        {simulationResult.carbonSavings > 0 ? `-${simulationResult.carbonSavings}` : `+${Math.abs(simulationResult.carbonSavings)}`} tons
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Water Usage Reduction</span>
                      <span className={`text-lg font-bold ${simulationResult.waterSavings > 0 ? 'text-blue-600' : 'text-red-600'}`} data-testid="text-water-savings">
                        {simulationResult.waterSavings > 0 ? `-${simulationResult.waterSavings}` : `+${Math.abs(simulationResult.waterSavings)}`} L
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Cost Impact</span>
                      <span className={`text-lg font-bold ${simulationResult.costImpact > 0 ? 'text-red-600' : 'text-green-600'}`} data-testid="text-cost-impact">
                        {simulationResult.costImpact > 0 ? `+$${simulationResult.costImpact.toLocaleString()}` : `-$${Math.abs(simulationResult.costImpact).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg" data-testid="card-score-comparison">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                    Sustainability Score Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">Current Supplier</span>
                        <span className="font-bold text-gray-900" data-testid="text-current-score">
                          {simulationResult.currentSupplier.sustainabilityScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${simulationResult.currentSupplier.sustainabilityScore >= 80 ? 'bg-green-500' : simulationResult.currentSupplier.sustainabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${simulationResult.currentSupplier.sustainabilityScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-700 font-medium">Prospective Supplier</span>
                        <span className="font-bold text-gray-900" data-testid="text-prospective-score">
                          {simulationResult.prospectiveSupplier.sustainabilityScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${simulationResult.prospectiveSupplier.sustainabilityScore >= 80 ? 'bg-green-500' : simulationResult.prospectiveSupplier.sustainabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${simulationResult.prospectiveSupplier.sustainabilityScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Chart */}
            <Card className="shadow-lg" data-testid="chart-comparison">
              <CardHeader>
                <CardTitle>Environmental Impact Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart 
                  currentSupplier={simulationResult.currentSupplier}
                  prospectiveSupplier={simulationResult.prospectiveSupplier}
                  orderQuantity={parseInt(orderQuantity)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
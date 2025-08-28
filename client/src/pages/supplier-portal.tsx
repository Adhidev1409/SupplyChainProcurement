import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplet, CheckCircle } from "lucide-react";
import PerformanceRadarChart from "@/components/charts/performance-radar-chart";
import HistoricalFootprintChart from "@/components/charts/historical-footprint-chart";
import { generateRecommendations } from "@/lib/data";
import { type SupplierWithCalculated } from "@shared/schema";

export default function SupplierPortalPage() {
  // For demo purposes, we'll use the first supplier as the "logged-in" supplier
  const { data: suppliers = [], isLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  const currentSupplier = suppliers.find(s => s.sustainabilityScore >= 80) || suppliers[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading supplier portal...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSupplier) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg text-muted-foreground">No supplier data available</div>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = generateRecommendations(currentSupplier);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="portal-title">
            Supplier Portal
          </h1>
          <p className="text-muted-foreground">View your sustainability performance and track improvements</p>
        </div>

        {/* Supplier Info Card */}
        <Card className="shadow-lg mb-8" data-testid="supplier-info-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2" data-testid="supplier-name">
                  {currentSupplier.name}
                </h2>
                <p className="text-muted-foreground">
                  Supplier ID: <span data-testid="supplier-id">#{currentSupplier.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-accent mb-1" data-testid="sustainability-score">
                  {currentSupplier.sustainabilityScore}
                </div>
                <div className="text-sm text-muted-foreground">Sustainability Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg" data-testid="metric-carbon">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-4">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                  <p className="text-2xl font-bold" data-testid="carbon-footprint">
                    {currentSupplier.carbonFootprint.toLocaleString()} tons
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="metric-water">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg mr-4">
                  <Droplet className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Water Usage</p>
                  <p className="text-2xl font-bold" data-testid="water-usage">
                    {currentSupplier.waterUsage.toLocaleString()} L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="metric-risk">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/50 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge 
                    variant={currentSupplier.riskLevel === 'Low' ? 'default' : currentSupplier.riskLevel === 'Medium' ? 'secondary' : 'destructive'}
                    data-testid="risk-level"
                  >
                    {currentSupplier.riskLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg" data-testid="my-performance-chart">
            <CardHeader>
              <CardTitle>My Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceRadarChart suppliers={[currentSupplier]} />
            </CardContent>
          </Card>

          <Card className="shadow-lg" data-testid="my-historical-chart">
            <CardHeader>
              <CardTitle>My Historical Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoricalFootprintChart supplier={currentSupplier} />
            </CardContent>
          </Card>
        </div>

        {/* My Improvement Recommendations */}
        <Card className="shadow-lg" data-testid="my-recommendations">
          <CardHeader>
            <CardTitle>Your Personalized Improvement Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`border-l-4 pl-4 p-4 rounded ${
                    rec.color === 'primary' ? 'border-primary bg-primary/5' :
                    rec.color === 'accent' ? 'border-accent bg-accent/5' :
                    rec.color === 'secondary' ? 'border-secondary bg-secondary/5' :
                    'border-destructive bg-destructive/5'
                  }`}
                  data-testid={`my-recommendation-${index}`}
                >
                  <h3 className={`font-semibold mb-2 ${
                    rec.color === 'primary' ? 'text-primary' :
                    rec.color === 'accent' ? 'text-accent' :
                    rec.color === 'secondary' ? 'text-secondary-foreground' :
                    'text-destructive'
                  }`}>
                    {rec.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                  <div className="mt-2">
                    <Badge variant={rec.color === 'destructive' ? 'destructive' : 'outline'}>
                      Priority: {rec.color === 'primary' ? 'High' : rec.color === 'accent' ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

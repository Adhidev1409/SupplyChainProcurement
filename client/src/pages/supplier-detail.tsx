import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PerformanceRadarChart from "@/components/charts/performance-radar-chart";
import HistoricalFootprintChart from "@/components/charts/historical-footprint-chart";
import { generateRecommendations } from "@/lib/data";
import { type SupplierWithCalculated } from "@shared/schema";

export default function SupplierDetailPage() {
  const [, params] = useRoute("/procurement/suppliers/:id");
  const supplierId = params?.id;

  const { data: supplier, isLoading } = useQuery<SupplierWithCalculated>({
    queryKey: ["/api/suppliers", supplierId],
    enabled: !!supplierId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading supplier details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg text-muted-foreground">Supplier not found</div>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = generateRecommendations(supplier);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/procurement/suppliers">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Suppliers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="supplier-name">
            {supplier.name}
          </h1>
          <p className="text-muted-foreground">Detailed supplier performance analysis and recommendations</p>
        </div>

        {/* Supplier Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg" data-testid="card-sustainability-score">
            <CardContent className="p-6">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  supplier.sustainabilityScore >= 80 ? 'text-accent' : 
                  supplier.sustainabilityScore >= 60 ? 'text-yellow-600' : 'text-destructive'
                }`} data-testid="text-sustainability-score">
                  {supplier.sustainabilityScore}
                </div>
                <div className="text-sm text-muted-foreground">Sustainability Score</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="card-carbon-footprint">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2" data-testid="text-carbon-footprint">
                  {supplier.carbonFootprint.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Carbon Footprint (tons)</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="card-water-usage">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-foreground mb-2" data-testid="text-water-usage">
                  {supplier.waterUsage.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Water Usage (L)</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="card-risk-level">
            <CardContent className="p-6">
              <div className="text-center">
                <Badge 
                  variant={supplier.riskLevel === 'Low' ? 'default' : supplier.riskLevel === 'Medium' ? 'secondary' : 'destructive'}
                  className="text-sm"
                  data-testid="badge-risk-level"
                >
                  {supplier.riskLevel} Risk
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">Risk Assessment</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg" data-testid="chart-performance-breakdown">
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceRadarChart suppliers={[supplier]} />
            </CardContent>
          </Card>

          <Card className="shadow-lg" data-testid="chart-historical-footprint">
            <CardHeader>
              <CardTitle>Historical Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoricalFootprintChart supplier={supplier} />
            </CardContent>
          </Card>
        </div>

        {/* Improvement Recommendations */}
        <Card className="shadow-lg" data-testid="recommendations-card">
          <CardHeader>
            <CardTitle>Personalized Improvement Recommendations</CardTitle>
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
                  data-testid={`recommendation-${index}`}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

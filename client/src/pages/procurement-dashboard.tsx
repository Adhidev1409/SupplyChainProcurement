import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, FileText } from "lucide-react";
import RiskDistributionChart from "@/components/charts/risk-distribution-chart";
import ScoreDistributionChart from "@/components/charts/score-distribution-chart";
import PerformanceRadarChart from "@/components/charts/performance-radar-chart";
import { type SupplierWithCalculated } from "@shared/schema";

interface DashboardMetrics {
  totalSuppliers: number;
  avgScore: number;
  certifiedSuppliers: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export default function ProcurementDashboard() {
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (suppliersLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-title">
            Procurement Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor supplier sustainability performance and key metrics</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg" data-testid="card-total-suppliers">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                  <p className="text-2xl font-bold" data-testid="text-total-suppliers">
                    {metrics?.totalSuppliers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="card-avg-score">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Sustainability Score</p>
                  <p className="text-2xl font-bold" data-testid="text-avg-score">
                    {metrics?.avgScore || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg" data-testid="card-certified-suppliers">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/50 rounded-lg mr-4">
                  <FileText className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certified Suppliers</p>
                  <p className="text-2xl font-bold" data-testid="text-certified-suppliers">
                    {metrics?.certifiedSuppliers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg" data-testid="chart-risk-distribution">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskDistributionChart data={metrics?.riskDistribution} />
            </CardContent>
          </Card>

          <Card className="shadow-lg" data-testid="chart-score-distribution">
            <CardHeader>
              <CardTitle>Sustainability Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDistributionChart suppliers={suppliers} />
            </CardContent>
          </Card>
        </div>

        {/* Average Performance Radar Chart */}
        <Card className="shadow-lg" data-testid="chart-performance-radar">
          <CardHeader>
            <CardTitle>Average Performance by Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceRadarChart suppliers={suppliers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

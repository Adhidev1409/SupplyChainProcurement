import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Users, TrendingUp, Shield, AlertTriangle, Trophy, CheckCircle, Settings } from "lucide-react";
import { Link } from "wouter";
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

export default function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  if (metricsLoading || suppliersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor supplier sustainability performance and manage your supply chain ecosystem</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Suppliers</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metrics?.totalSuppliers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Active suppliers in system
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Sustainability Score</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metrics?.avgScore || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Out of 100 points
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ISO Certified</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metrics?.certifiedSuppliers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                ISO 14001 certified suppliers
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">High Risk Suppliers</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metrics?.riskDistribution?.high || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskDistributionChart data={metrics?.riskDistribution} />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Sustainability Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDistributionChart suppliers={suppliers} />
            </CardContent>
          </Card>
        </div>

        {/* Top Suppliers Ranking and Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Top Suppliers by Sustainability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers
                  .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
                  .slice(0, 5)
                  .map((supplier, index) => (
                    <Link key={supplier.id} href={`/admin/suppliers/${supplier.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                            <p className="text-sm text-gray-600">{supplier.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={
                              supplier.riskLevel === 'Low' ? 'secondary' :
                              supplier.riskLevel === 'Medium' ? 'default' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {supplier.riskLevel}
                          </Badge>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">{supplier.sustainabilityScore}</p>
                            <p className="text-xs text-gray-500">Score</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                {suppliers?.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No suppliers found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                Average Performance by Metric
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceRadarChart suppliers={suppliers} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/suppliers">
                <button className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Manage Suppliers</h3>
                      <p className="text-sm text-gray-600">View, edit, and manage all suppliers</p>
                    </div>
                  </div>
                </button>
              </Link>

              <Link href="/admin/weights-config">
                <button className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Configure Weights</h3>
                      <p className="text-sm text-gray-600">Adjust sustainability scoring parameters</p>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

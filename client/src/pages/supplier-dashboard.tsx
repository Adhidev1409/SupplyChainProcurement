import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Building, TrendingUp, Shield, AlertTriangle, FileText, Settings } from "lucide-react";
import { Link } from "wouter";
import { type SupplierWithCalculated } from "@shared/schema";

export default function SupplierDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000,
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/my-suppliers"],
  });

  if (metricsLoading || suppliersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mySupplier = suppliers?.[0]; // Supplier users should only have one supplier

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your supplier management portal</p>
      </div>

      {/* My Company Info */}
      {mySupplier && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>{mySupplier.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product Category</p>
                <p className="font-medium">{mySupplier.productCategory}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lead Time</p>
                <p className="font-medium">{mySupplier.leadTimeDays} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sustainability Score</p>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{mySupplier.sustainabilityScore}</span>
                  <Badge
                    variant={
                      mySupplier.riskLevel === 'Low' ? 'secondary' :
                      mySupplier.riskLevel === 'Medium' ? 'default' : 'destructive'
                    }
                  >
                    {mySupplier.riskLevel} Risk
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Certifications</p>
                <div className="flex space-x-2">
                  {mySupplier.ISO14001 && <Badge variant="outline">ISO 14001</Badge>}
                  {mySupplier.wasteGeneration < 10 && <Badge variant="outline">Low Waste</Badge>}
                  {mySupplier.sustainabilityScore > 75 && <Badge variant="outline">High Sustainability</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/supplier/portal">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <span>My Portal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View and update your company information</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/supplier/onboarding">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Update Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Update your sustainability metrics and information</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Carbon Footprint</span>
                <span className="font-medium">{mySupplier?.carbonFootprint} tons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Water Usage</span>
                <span className="font-medium">{mySupplier?.waterUsage} L/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Waste Generation</span>
                <span className="font-medium">{mySupplier?.wasteGeneration} tons/month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {mySupplier && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!mySupplier.ISO14001 && (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Consider ISO 14001 Certification</span>
                  </div>
                  <p className="text-blue-700 mt-1">Getting certified could improve your sustainability score by up to 15 points.</p>
                </div>
              )}

              {mySupplier.carbonFootprint > 3000 && (
                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">High Carbon Footprint</span>
                  </div>
                  <p className="text-orange-700 mt-1">Consider implementing carbon reduction strategies to improve your score.</p>
                </div>
              )}

              {mySupplier.wasteGeneration > 15 && (
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Waste Reduction Opportunity</span>
                  </div>
                  <p className="text-green-700 mt-1">Reducing waste generation below 15 tons could significantly boost your sustainability score.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

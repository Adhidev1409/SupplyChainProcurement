import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import {
  Building,
  MapPin,
  Users,
  Leaf,
  Droplets,
  Recycle,
  Zap,
  FileText,
  TrendingUp,
  AlertTriangle,
  Shield,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SupplierPortalPage() {
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["/api/my-suppliers"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const supplier = suppliers?.[0]; // Supplier users should only have one supplier

  if (!supplier) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Supplier Portal</h1>
          <p className="text-gray-600 mb-6">No supplier information found.</p>
          <Link href="/supplier/onboarding">
            <Button>Complete Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = supplier.historicalCarbon?.map((value, index) => ({
    month: `Month ${index + 1}`,
    carbon: value,
  })) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supplier Portal</h1>
        <p className="text-gray-600 mt-2">View your company information and performance metrics</p>
      </div>

      {/* Company Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-6 w-6" />
            <span>Company Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-semibold">{supplier.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{supplier.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="font-semibold">{supplier.employeeCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Sustainability Score</p>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold">{supplier.sustainabilityScore}</p>
                  <Badge
                    variant={
                      supplier.riskLevel === 'Low' ? 'secondary' :
                      supplier.riskLevel === 'Medium' ? 'default' : 'destructive'
                    }
                  >
                    {supplier.riskLevel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier.carbonFootprint}</div>
            <p className="text-xs text-muted-foreground">tons per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Usage</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier.waterUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">liters per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Reduction</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier.wasteReduction}%</div>
            <p className="text-xs text-muted-foreground">annual reduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier.energyEfficiency}%</div>
            <p className="text-xs text-muted-foreground">efficiency rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplier.riskScore}</div>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Certifications and Policies */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Certifications & Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              {supplier.ISO14001 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Shield className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">ISO 14001</p>
                <p className="text-sm text-gray-600">
                  {supplier.ISO14001 ? "Certified" : "Not certified"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              {supplier.recyclingPolicy ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Recycle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Recycling Policy</p>
                <p className="text-sm text-gray-600">
                  {supplier.recyclingPolicy ? "Active" : "Not active"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              {supplier.waterPolicy ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Droplets className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Water Policy</p>
                <p className="text-sm text-gray-600">
                  {supplier.waterPolicy ? "Published" : "Not published"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              {supplier.sustainabilityReport ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <FileText className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Sustainability Report</p>
                <p className="text-sm text-gray-600">
                  {supplier.sustainabilityReport ? "Published" : "Not published"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carbon Footprint History */}
      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Carbon Footprint History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="carbon"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/supplier/onboarding">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
            <Link href="/supplier/dashboard">
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { MapPin, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { type SupplierWithCalculated } from "@shared/schema";

export default function AdminRiskMapPage() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const { data: suppliers = [], isLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  // Group suppliers by region and calculate regional risk metrics
  const regionalData = useMemo(() => {
    const regions = suppliers.reduce((acc, supplier) => {
      // Use product category to determine mock region
      const regionMap: { [key: string]: string } = {
        'Electronics': 'Asia-Pacific',
        'Textiles': 'Europe',
        'Food': 'North America',
        'Automotive': 'North America',
        'Chemicals': 'Europe',
        'Pharmaceuticals': 'Asia-Pacific'
      };
      const region = regionMap[supplier.productCategory] || 'Other';
      if (!acc[region]) {
        acc[region] = {
          name: region,
          suppliers: [],
          avgScore: 0,
          riskLevel: 'low' as const,
          totalSuppliers: 0,
        };
      }
      acc[region].suppliers.push(supplier);
      acc[region].totalSuppliers = acc[region].suppliers.length;
      return acc;
    }, {} as Record<string, {
      name: string;
      suppliers: SupplierWithCalculated[];
      avgScore: number;
      riskLevel: 'low' | 'medium' | 'high';
      totalSuppliers: number;
    }>);

    // Calculate metrics for each region
    Object.values(regions).forEach(region => {
      region.avgScore = region.suppliers.reduce((sum, s) => sum + s.sustainabilityScore, 0) / region.suppliers.length;
      
      // Determine risk level based on average score and risk factors
      const highRiskCount = region.suppliers.filter(s => s.riskLevel === 'High').length;
      const highRiskPercentage = highRiskCount / region.suppliers.length;
      
      if (highRiskPercentage > 0.4 || region.avgScore < 70) {
        region.riskLevel = 'high';
      } else if (highRiskPercentage > 0.2 || region.avgScore < 85) {
        region.riskLevel = 'medium';
      } else {
        region.riskLevel = 'low';
      }
    });

    return regions;
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      // Use same region mapping logic
      const regionMap: { [key: string]: string } = {
        'Electronics': 'Asia-Pacific',
        'Textiles': 'Europe',
        'Food': 'North America',
        'Automotive': 'North America',
        'Chemicals': 'Europe',
        'Pharmaceuticals': 'Asia-Pacific'
      };
      const region = regionMap[supplier.productCategory] || 'Other';
      const matchesRegion = selectedRegion === "all" || region === selectedRegion;
      const matchesRisk = riskFilter === "all" || supplier.riskLevel === riskFilter;
      return matchesRegion && matchesRisk;
    });
  }, [suppliers, selectedRegion, riskFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading risk map data...</div>
          </div>
        </div>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="default">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Completed</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="risk-map-title">
            Geographic Risk Assessment
          </h1>
          <p className="text-gray-600">Analyze supplier sustainability risks by geographic region</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Filter by Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger data-testid="select-region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {Object.keys(regionalData).map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Filter by Risk Level</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger data-testid="select-risk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="Low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Overview Map */}
        <Card className="shadow-lg mb-8" data-testid="regional-overview">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Regional Risk Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(regionalData).map((region) => (
                <div
                  key={region.name}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer bg-white"
                  onClick={() => setSelectedRegion(region.name)}
                  data-testid={`region-card-${region.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{region.name}</h3>
                    </div>
                    {getRiskBadge(region.riskLevel)}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Suppliers:</span>
                      <span className="font-semibold text-gray-900">{region.totalSuppliers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg Score:</span>
                      <span className="font-semibold text-green-600">{Math.round(region.avgScore)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Risk Factors:</span>
                      <div className="flex space-x-1">
                        {region.suppliers.filter(s => s.riskLevel === 'High').length > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {region.suppliers.some(s => !s.ISO14001) && (
                          <Shield className="w-4 h-4 text-yellow-500" />
                        )}
                        {region.suppliers.some(s => s.carbonFootprint > 1000) && (
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk level indicator */}
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getRiskColor(region.riskLevel)} transition-all duration-300`}
                      style={{ width: `${Math.min(100, region.avgScore)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Details for Selected Region/Risk */}
        <Card className="shadow-lg" data-testid="supplier-details">
          <CardHeader>
            <CardTitle>
              {selectedRegion === "all" ? "All Suppliers" : `Suppliers in ${selectedRegion}`}
              {riskFilter !== "all" && ` - ${riskFilter} Risk`}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Showing {filteredSuppliers.length} suppliers
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow" data-testid={`supplier-${supplier.id}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Supplier Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900" data-testid={`supplier-name-${supplier.id}`}>
                            {supplier.name}
                          </h4>
                          <p className="text-sm text-gray-600">{supplier.productCategory}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk & Score */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        {getRiskBadge(supplier.riskLevel)}
                        <div className="text-sm text-gray-600">
                          Score: <span className="font-semibold text-green-600">{supplier.sustainabilityScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="lg:col-span-4">
                      <div className="flex flex-wrap gap-2">
                        {supplier.carbonFootprint > 1000 && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            High Carbon ({supplier.carbonFootprint.toLocaleString()}t)
                          </Badge>
                        )}
                        {supplier.waterUsage > 1500 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            High Water Usage
                          </Badge>
                        )}
                        {!supplier.ISO14001 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            No ISO 14001
                          </Badge>
                        )}
                        {supplier.wasteGeneration > 15 && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            High Waste Generation
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-3">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/suppliers/${supplier.id}`}>
                          <button 
                            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            data-testid={`button-view-${supplier.id}`}
                          >
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 opacity-50 mb-4" />
                <p className="text-lg text-gray-500 mb-2">No suppliers found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your region or risk level filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

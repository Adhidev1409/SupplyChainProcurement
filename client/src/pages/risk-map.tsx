import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { MapPin, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import { type SupplierWithCalculated } from "@shared/schema";

export default function RiskMapPage() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const { data: suppliers = [], isLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  // Group suppliers by region and calculate regional risk metrics
  const regionalData = useMemo(() => {
    const regions = suppliers.reduce((acc, supplier) => {
      const region = supplier.location.split(',').pop()?.trim() || 'Unknown';
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
      const region = supplier.location.split(',').pop()?.trim() || 'Unknown';
      const matchesRegion = selectedRegion === "all" || region === selectedRegion;
      const matchesRisk = riskFilter === "all" || supplier.riskLevel === riskFilter;
      return matchesRegion && matchesRisk;
    });
  }, [suppliers, selectedRegion, riskFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
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
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="risk-map-title">
            Geographic Risk Assessment
          </h1>
          <p className="text-muted-foreground">Analyze supplier sustainability risks by geographic region</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Region</label>
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
            <CardContent className="p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Risk Level</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger data-testid="select-risk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Overview Map */}
        <Card className="shadow-lg mb-8" data-testid="regional-overview">
          <CardHeader>
            <CardTitle>Regional Risk Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(regionalData).map((region) => (
                <div
                  key={region.name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedRegion(region.name)}
                  data-testid={`region-card-${region.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{region.name}</h3>
                    </div>
                    {getRiskBadge(region.riskLevel)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Suppliers:</span>
                      <span className="font-medium">{region.totalSuppliers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Score:</span>
                      <span className="font-medium">{Math.round(region.avgScore)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Factors:</span>
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
                  <div className="mt-3 w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getRiskColor(region.riskLevel)}`}
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
              {riskFilter !== "all" && ` - ${riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1)} Risk`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filteredSuppliers.length} suppliers
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="border rounded-lg p-4" data-testid={`supplier-${supplier.id}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Supplier Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium" data-testid={`supplier-name-${supplier.id}`}>
                            {supplier.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{supplier.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk & Score */}
                    <div className="lg:col-span-2">
                      <div className="space-y-1">
                        {getRiskBadge(supplier.riskLevel)}
                        <div className="text-sm text-muted-foreground">
                          Score: <span className="font-medium text-accent">{supplier.sustainabilityScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="lg:col-span-4">
                      <div className="flex flex-wrap gap-2">
                        {supplier.carbonFootprint > 1000 && (
                          <Badge variant="outline" className="text-xs">
                            High Carbon ({supplier.carbonFootprint.toLocaleString()}t)
                          </Badge>
                        )}
                        {supplier.waterUsage > 50000 && (
                          <Badge variant="outline" className="text-xs">
                            High Water Usage
                          </Badge>
                        )}
                        {!supplier.ISO14001 && (
                          <Badge variant="outline" className="text-xs">
                            No ISO 14001
                          </Badge>
                        )}
                        {!supplier.recyclingPolicy && (
                          <Badge variant="outline" className="text-xs">
                            No Recycling Policy
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-3">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/procurement/suppliers/${supplier.id}`}>
                          <button 
                            className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
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
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No suppliers found</p>
                <p className="text-sm text-muted-foreground">
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
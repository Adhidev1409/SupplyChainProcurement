import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PerformersChart from "@/components/charts/performers-chart";
import { type SupplierWithCalculated } from "@shared/schema";

export default function SuppliersListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const [sortBy, setSortBy] = useState("score-desc");

  const { data: suppliers = [], isLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = !riskFilter || riskFilter === "all" || supplier.riskLevel.toLowerCase() === riskFilter;
      const matchesCertification = !certificationFilter || certificationFilter === "all" ||
        (certificationFilter === "certified" && supplier.ISO14001) ||
        (certificationFilter === "not-certified" && !supplier.ISO14001);
      
      return matchesSearch && matchesRisk && matchesCertification;
    });

    // Sort suppliers
    switch (sortBy) {
      case "score-desc":
        filtered.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
        break;
      case "score-asc":
        filtered.sort((a, b) => a.sustainabilityScore - b.sustainabilityScore);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "carbon-asc":
        filtered.sort((a, b) => a.carbonFootprint - b.carbonFootprint);
        break;
      default:
        break;
    }

    return filtered;
  }, [suppliers, searchTerm, riskFilter, certificationFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading suppliers...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="suppliers-title">
            Supplier List & Ranking
          </h1>
          <p className="text-muted-foreground">Filter and analyze supplier performance data</p>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg mb-8" data-testid="filters-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Suppliers</Label>
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger data-testid="select-risk">
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Certification</Label>
                <Select value={certificationFilter} onValueChange={setCertificationFilter}>
                  <SelectTrigger data-testid="select-certification">
                    <SelectValue placeholder="All Certifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Certifications</SelectItem>
                    <SelectItem value="certified">ISO 14001 Certified</SelectItem>
                    <SelectItem value="not-certified">Not Certified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score-desc">Sustainability Score (High to Low)</SelectItem>
                    <SelectItem value="score-asc">Sustainability Score (Low to High)</SelectItem>
                    <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                    <SelectItem value="carbon-asc">Carbon Footprint (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top vs Bottom Performers Chart */}
        <Card className="shadow-lg mb-8" data-testid="performers-chart">
          <CardHeader>
            <CardTitle>Supplier Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformersChart suppliers={filteredAndSortedSuppliers} />
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="shadow-lg overflow-hidden" data-testid="suppliers-table">
          <CardHeader>
            <CardTitle>All Suppliers ({filteredAndSortedSuppliers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sustainability Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Carbon Footprint (tons)</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors" data-testid={`supplier-row-${supplier.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                              supplier.sustainabilityScore >= 80 ? 'bg-accent' : 
                              supplier.sustainabilityScore >= 60 ? 'bg-yellow-500' : 'bg-destructive'
                            }`}>
                              {supplier.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground" data-testid={`text-name-${supplier.id}`}>
                              {supplier.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`text-sm font-semibold ${
                            supplier.sustainabilityScore >= 80 ? 'text-accent' : 
                            supplier.sustainabilityScore >= 60 ? 'text-yellow-600' : 'text-destructive'
                          }`} data-testid={`text-score-${supplier.id}`}>
                            {supplier.sustainabilityScore}
                          </span>
                          <div className="ml-2 w-16 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                supplier.sustainabilityScore >= 80 ? 'bg-accent' : 
                                supplier.sustainabilityScore >= 60 ? 'bg-yellow-500' : 'bg-destructive'
                              }`}
                              style={{ width: `${supplier.sustainabilityScore}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={supplier.riskLevel === 'Low' ? 'default' : supplier.riskLevel === 'Medium' ? 'secondary' : 'destructive'}
                          data-testid={`badge-risk-${supplier.id}`}
                        >
                          {supplier.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-carbon-${supplier.id}`}>
                        {supplier.carbonFootprint.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.ISO14001 ? 'default' : 'outline'} data-testid={`badge-cert-${supplier.id}`}>
                          {supplier.ISO14001 ? 'ISO 14001' : 'None'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/procurement/suppliers/${supplier.id}`}>
                          <Button variant="link" className="p-0" data-testid={`button-details-${supplier.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

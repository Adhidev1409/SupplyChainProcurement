import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { type SupplierWithCalculated } from "@shared/schema";

export default function QuestionnaireResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: suppliers = [], isLoading } = useQuery<SupplierWithCalculated[]>({
    queryKey: ["/api/suppliers"],
  });

  // Mock questionnaire completion data - in real app this would come from API
  const questionnaireData = useMemo(() => {
    return suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      location: supplier.location,
      completedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "completed",
      responses: {
        carbonFootprint: supplier.carbonFootprint,
        waterUsage: supplier.waterUsage,
        ISO14001: supplier.ISO14001,
        recyclingPolicy: supplier.recyclingPolicy,
        wasteReduction: supplier.wasteReduction,
        energyEfficiency: supplier.energyEfficiency,
        waterPolicy: supplier.waterPolicy,
        sustainabilityReport: supplier.sustainabilityReport,
        employeeCount: supplier.employeeCount,
      },
      sustainabilityScore: supplier.sustainabilityScore,
      riskLevel: supplier.riskLevel,
    }));
  }, [suppliers]);

  const filteredResults = useMemo(() => {
    let filtered = questionnaireData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort results
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());
        break;
      case "score-desc":
        filtered.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [questionnaireData, searchTerm, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-lg">Loading questionnaire results...</div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'incomplete':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'incomplete':
        return <Badge variant="destructive">Incomplete</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="questionnaire-title">
            Supplier Questionnaire Results
          </h1>
          <p className="text-muted-foreground">Review and analyze completed sustainability questionnaires from suppliers</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg" data-testid="stat-total">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{questionnaireData.length}</div>
                <div className="text-sm text-muted-foreground">Total Responses</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg" data-testid="stat-completed">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {questionnaireData.filter(q => q.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg" data-testid="stat-pending">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {questionnaireData.filter(q => q.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg" data-testid="stat-avg-score">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-foreground mb-1">
                  {Math.round(questionnaireData.reduce((sum, q) => sum + q.sustainabilityScore, 0) / questionnaireData.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Score</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg mb-8" data-testid="filters-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Suppliers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <div>
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
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
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="score-desc">Highest Score</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="shadow-lg hover:shadow-xl transition-shadow" data-testid={`result-${result.id}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Supplier Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold" data-testid={`supplier-name-${result.id}`}>{result.name}</h3>
                        <p className="text-sm text-muted-foreground">{result.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Score */}
                  <div className="lg:col-span-2">
                    <div className="space-y-1">
                      {getStatusBadge(result.status)}
                      <div className="text-sm text-muted-foreground">
                        Score: <span className="font-medium text-accent">{result.sustainabilityScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Responses */}
                  <div className="lg:col-span-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Carbon:</span>
                        <span className="ml-1 font-medium">{result.responses.carbonFootprint.toLocaleString()}t</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Water:</span>
                        <span className="ml-1 font-medium">{result.responses.waterUsage.toLocaleString()}L</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ISO 14001:</span>
                        <span className={`ml-1 font-medium ${result.responses.ISO14001 ? 'text-accent' : 'text-muted-foreground'}`}>
                          {result.responses.ISO14001 ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recycling:</span>
                        <span className={`ml-1 font-medium ${result.responses.recyclingPolicy ? 'text-accent' : 'text-muted-foreground'}`}>
                          {result.responses.recyclingPolicy ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Actions */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {result.completedDate}
                      </div>
                      <div className="space-x-2">
                        <Link href={`/procurement/suppliers/${result.id}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-${result.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No questionnaire results found</p>
                <p>Try adjusting your search criteria or filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
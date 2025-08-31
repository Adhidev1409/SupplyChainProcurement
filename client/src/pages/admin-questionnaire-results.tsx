import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { CheckCircle, XCircle, Clock, Search, FileText, TrendingUp } from "lucide-react";
import { type SupplierWithCalculated } from "@shared/schema";

export default function AdminQuestionnaireResultsPage() {
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
      <div className="min-h-screen bg-gray-50 py-8">
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'incomplete':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'incomplete':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Incomplete</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center" data-testid="questionnaire-title">
            <FileText className="h-8 w-8 mr-3 text-blue-500" />
            Supplier Questionnaire Results
          </h1>
          <p className="text-gray-600">Review and analyze completed sustainability questionnaires from suppliers</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg bg-white" data-testid="stat-total">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{questionnaireData.length}</div>
                <div className="text-sm text-gray-600">Total Responses</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-white" data-testid="stat-completed">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {questionnaireData.filter(q => q.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-white" data-testid="stat-pending">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {questionnaireData.filter(q => q.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-white" data-testid="stat-avg-score">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {Math.round(questionnaireData.reduce((sum, q) => sum + q.sustainabilityScore, 0) / questionnaireData.length)}
                </div>
                <div className="text-sm text-gray-600">Avg. Score</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg mb-8 bg-white" data-testid="filters-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search Suppliers</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                <Label className="text-sm font-medium text-gray-700">Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status" className="mt-1">
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
                <Label className="text-sm font-medium text-gray-700">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort" className="mt-1">
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
            <Card key={result.id} className="shadow-lg hover:shadow-xl transition-all duration-200 bg-white" data-testid={`result-${result.id}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Supplier Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getStatusIcon(result.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900" data-testid={`supplier-name-${result.id}`}>{result.name}</h3>
                        <p className="text-sm text-gray-600">{result.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Score */}
                  <div className="lg:col-span-2">
                    <div className="space-y-2">
                      {getStatusBadge(result.status)}
                      <div className="text-sm text-gray-600">
                        Score: <span className="font-semibold text-green-600">{result.sustainabilityScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Responses */}
                  <div className="lg:col-span-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Carbon:</span>
                        <span className="ml-1 font-semibold text-gray-900">{result.responses.carbonFootprint.toLocaleString()}t</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Water:</span>
                        <span className="ml-1 font-semibold text-gray-900">{result.responses.waterUsage.toLocaleString()}L</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">ISO 14001:</span>
                        <span className={`ml-1 font-semibold ${result.responses.ISO14001 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.responses.ISO14001 ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Recycling:</span>
                        <span className={`ml-1 font-semibold ${result.responses.recyclingPolicy ? 'text-green-600' : 'text-red-600'}`}>
                          {result.responses.recyclingPolicy ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Actions */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">Completed:</div>
                        <div>{result.completedDate}</div>
                      </div>
                      <div className="space-x-2">
                        <Link href={`/admin/suppliers/${result.id}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-${result.id}`} className="hover:bg-blue-50">
                            <TrendingUp className="h-4 w-4 mr-1" />
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
          <Card className="shadow-lg bg-white">
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
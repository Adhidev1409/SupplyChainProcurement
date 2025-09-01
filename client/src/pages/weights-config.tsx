import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WeightConfig {
  carbonFootprint: number;
  waterUsage: number;
  recyclingPolicy: number;
  iso14001: number;
  wasteReduction: number;
  energyEfficiency: number;
  waterPolicy: number;
  sustainabilityReport: number;
}

const fetchWeights = async (): Promise<WeightConfig> => {
  const response = await fetch("/api/metric-weights");
  if (!response.ok) {
    throw new Error("Failed to fetch weights from the server.");
  }
  return response.json();
};

const saveWeightsApi = async (weights: WeightConfig): Promise<WeightConfig> => {
  const response = await fetch("/api/metric-weights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  });
  if (!response.ok) {
    throw new Error("Failed to save weights to the server.");
  }
  return response.json();
};

export default function WeightsConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [weights, setWeights] = useState<WeightConfig | null>(null);

  // ✅ Use consistent queryKey
  const { data: initialWeights, isLoading } = useQuery({
    queryKey: ["metricWeights"],
    queryFn: fetchWeights,
  });

  const saveMutation = useMutation({
    mutationFn: saveWeightsApi,
    onSuccess: () => {
      toast({
        title: "Weights Saved Successfully",
        description: "The new configuration has been applied.",
      });

      // ✅ Invalidate queries with consistent keys and refetch immediately
      queryClient.invalidateQueries({ queryKey: ["metricWeights"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      
      // Force immediate refetch for real-time update
      queryClient.refetchQueries({ queryKey: ["metricWeights"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Saving Weights",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (initialWeights) {
      setWeights(initialWeights);
    }
  }, [initialWeights]);

  const totalWeight = weights
    ? Object.values(weights).reduce((sum, w) => sum + w, 0)
    : 0;

  const updateWeight = (field: keyof WeightConfig, value: number[]) => {
    setWeights((prev) => (prev ? { ...prev, [field]: value[0] } : null));
  };

  const handleSaveWeights = () => {
    if (!weights) return;

    if (Math.abs(totalWeight - 100) > 5) {
      toast({
        title: "Invalid Weight Configuration",
        description: "Total weights should be approximately 100 points.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(weights);
  };

  const handleResetToDefaults = () => {
    if (initialWeights) {
      setWeights(initialWeights);
    }
  };

  if (isLoading || !weights) {
    return <div className="p-8">Loading configuration...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="weights-title">
            Sustainability Scoring Weights
          </h1>
          <p className="text-muted-foreground">
            Configure the importance of each sustainability metric in the overall scoring system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: sliders */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg" data-testid="weights-config-card">
              <CardHeader>
                <CardTitle>Metric Weights Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the weights to reflect your organization's sustainability priorities
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Environmental Impact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">
                    Environmental Impact
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "carbonFootprint", label: "Carbon Footprint", max: 50 },
                      { key: "waterUsage", label: "Water Usage", max: 30 },
                      { key: "wasteReduction", label: "Waste Reduction", max: 20 },
                      { key: "energyEfficiency", label: "Energy Efficiency", max: 25 },
                    ].map(({ key, label, max }) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor={key}>{label}</Label>
                          <span className="text-sm font-medium">{weights[key as keyof WeightConfig]}%</span>
                        </div>
                        <Slider
                          id={key}
                          min={0}
                          max={max}
                          step={1}
                          value={[weights[key as keyof WeightConfig]]}
                          onValueChange={(value) => updateWeight(key as keyof WeightConfig, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications & Policies */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-accent">
                    Certifications & Policies
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "iso14001", label: "ISO 14001 Certification", max: 25 },
                      { key: "recyclingPolicy", label: "Recycling Policy", max: 20 },
                      { key: "waterPolicy", label: "Water Policy", max: 15 },
                      { key: "sustainabilityReport", label: "Sustainability Report", max: 20 },
                    ].map(({ key, label, max }) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor={key}>{label}</Label>
                          <span className="text-sm font-medium">{weights[key as keyof WeightConfig]}%</span>
                        </div>
                        <Slider
                          id={key}
                          min={0}
                          max={max}
                          step={1}
                          value={[weights[key as keyof WeightConfig]]}
                          onValueChange={(value) => updateWeight(key as keyof WeightConfig, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <Button
                    onClick={handleSaveWeights}
                    className="flex-1"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? "Saving..." : "Save Configuration"}
                  </Button>
                  <Button onClick={handleResetToDefaults} variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: summary */}
          <div>
            <Card className="shadow-lg" data-testid="weights-summary-card">
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Total Weight</span>
                      <span
                        className={`text-lg font-bold ${
                          Math.abs(totalWeight - 100) <= 5
                            ? "text-accent"
                            : "text-destructive"
                        }`}
                        data-testid="total-weight"
                      >
                        {totalWeight}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          Math.abs(totalWeight - 100) <= 5
                            ? "bg-accent"
                            : "bg-destructive"
                        }`}
                        style={{
                          width: `${Math.min(100, (totalWeight / 110) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: ~100 points
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Weight Distribution</h4>
                    {Object.entries(weights)
                      .sort(([, a], [, b]) => b - a)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">{value}%</span>
                        </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Impact Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      Changes to weights will immediately affect all supplier
                      sustainability scores and rankings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

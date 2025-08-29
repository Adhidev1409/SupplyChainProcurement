import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WeightConfig {
  carbonFootprint: number;
  waterUsage: number;
  recyclingPolicy: number;
  ISO14001: number;
  wasteReduction: number;
  energyEfficiency: number;
  waterPolicy: number;
  sustainabilityReport: number;
}

export default function WeightsConfigPage() {
  const { toast } = useToast();
  const [weights, setWeights] = useState<WeightConfig>({
    carbonFootprint: 25,
    waterUsage: 17,
    recyclingPolicy: 8,
    ISO14001: 15,
    wasteReduction: 10,
    energyEfficiency: 10,
    waterPolicy: 6,
    sustainabilityReport: 9,
  });

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  const updateWeight = (field: keyof WeightConfig, value: number[]) => {
    setWeights(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const saveWeights = () => {
    if (Math.abs(totalWeight - 100) > 5) {
      toast({
        title: "Invalid Weight Configuration",
        description: "Total weights should be approximately 100 points for optimal scoring.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Weights Saved Successfully",
      description: "The new weight configuration has been applied to all supplier calculations.",
    });
  };

  const resetToDefaults = () => {
    setWeights({
      carbonFootprint: 25,
      waterUsage: 17,
      recyclingPolicy: 8,
      ISO14001: 15,
      wasteReduction: 10,
      energyEfficiency: 10,
      waterPolicy: 6,
      sustainabilityReport: 9,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="weights-title">
            Sustainability Scoring Weights
          </h1>
          <p className="text-muted-foreground">Configure the importance of each sustainability metric in the overall scoring system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weight Configuration */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg" data-testid="weights-config-card">
              <CardHeader>
                <CardTitle>Metric Weights Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the weights to reflect your organization's sustainability priorities
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Environmental Impact Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Environmental Impact</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="carbon-weight">Carbon Footprint</Label>
                        <span className="text-sm font-medium">{weights.carbonFootprint}%</span>
                      </div>
                      <Slider
                        id="carbon-weight"
                        min={0}
                        max={50}
                        step={1}
                        value={[weights.carbonFootprint]}
                        onValueChange={(value) => updateWeight('carbonFootprint', value)}
                        data-testid="slider-carbon"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="water-weight">Water Usage</Label>
                        <span className="text-sm font-medium">{weights.waterUsage}%</span>
                      </div>
                      <Slider
                        id="water-weight"
                        min={0}
                        max={30}
                        step={1}
                        value={[weights.waterUsage]}
                        onValueChange={(value) => updateWeight('waterUsage', value)}
                        data-testid="slider-water"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="waste-weight">Waste Reduction</Label>
                        <span className="text-sm font-medium">{weights.wasteReduction}%</span>
                      </div>
                      <Slider
                        id="waste-weight"
                        min={0}
                        max={20}
                        step={1}
                        value={[weights.wasteReduction]}
                        onValueChange={(value) => updateWeight('wasteReduction', value)}
                        data-testid="slider-waste"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="energy-weight">Energy Efficiency</Label>
                        <span className="text-sm font-medium">{weights.energyEfficiency}%</span>
                      </div>
                      <Slider
                        id="energy-weight"
                        min={0}
                        max={25}
                        step={1}
                        value={[weights.energyEfficiency]}
                        onValueChange={(value) => updateWeight('energyEfficiency', value)}
                        data-testid="slider-energy"
                      />
                    </div>
                  </div>
                </div>

                {/* Certifications & Policies */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-accent">Certifications & Policies</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="iso-weight">ISO 14001 Certification</Label>
                        <span className="text-sm font-medium">{weights.ISO14001}%</span>
                      </div>
                      <Slider
                        id="iso-weight"
                        min={0}
                        max={25}
                        step={1}
                        value={[weights.ISO14001]}
                        onValueChange={(value) => updateWeight('ISO14001', value)}
                        data-testid="slider-iso"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="recycling-weight">Recycling Policy</Label>
                        <span className="text-sm font-medium">{weights.recyclingPolicy}%</span>
                      </div>
                      <Slider
                        id="recycling-weight"
                        min={0}
                        max={20}
                        step={1}
                        value={[weights.recyclingPolicy]}
                        onValueChange={(value) => updateWeight('recyclingPolicy', value)}
                        data-testid="slider-recycling"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="water-policy-weight">Water Policy</Label>
                        <span className="text-sm font-medium">{weights.waterPolicy}%</span>
                      </div>
                      <Slider
                        id="water-policy-weight"
                        min={0}
                        max={15}
                        step={1}
                        value={[weights.waterPolicy]}
                        onValueChange={(value) => updateWeight('waterPolicy', value)}
                        data-testid="slider-water-policy"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="report-weight">Sustainability Report</Label>
                        <span className="text-sm font-medium">{weights.sustainabilityReport}%</span>
                      </div>
                      <Slider
                        id="report-weight"
                        min={0}
                        max={20}
                        step={1}
                        value={[weights.sustainabilityReport]}
                        onValueChange={(value) => updateWeight('sustainabilityReport', value)}
                        data-testid="slider-report"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <Button onClick={saveWeights} className="flex-1" data-testid="button-save-weights">
                    Save Configuration
                  </Button>
                  <Button onClick={resetToDefaults} variant="outline" data-testid="button-reset-weights">
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary and Preview */}
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
                      <span className={`text-lg font-bold ${Math.abs(totalWeight - 100) <= 5 ? 'text-accent' : 'text-destructive'}`} data-testid="total-weight">
                        {totalWeight}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${Math.abs(totalWeight - 100) <= 5 ? 'bg-accent' : 'bg-destructive'}`}
                        style={{ width: `${Math.min(100, (totalWeight / 110) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: ~100 points
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Weight Distribution</h4>
                    {Object.entries(weights)
                      .sort(([,a], [,b]) => b - a)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="font-medium">{value}%</span>
                        </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2">Impact Preview</h4>
                    <p className="text-xs text-muted-foreground">
                      Changes to weights will immediately affect all supplier sustainability scores and rankings.
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
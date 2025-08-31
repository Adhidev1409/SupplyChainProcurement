import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertSupplierSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";

const updateSupplierSchema = insertSupplierSchema.omit({
  historicalCarbon: true,
  riskScore: true
});

type UpdateSupplierForm = z.infer<typeof updateSupplierSchema>;

export default function SupplierOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's supplier data
  const { data: mySupplier, isLoading: supplierLoading } = useQuery({
    queryKey: ["/api/my-suppliers"],
    onSuccess: (data) => {
      if (data && data.length > 0) {
        // Pre-populate form with existing data
        const supplier = data[0];
        form.reset({
          name: supplier.name,
          carbonFootprint: supplier.carbonFootprint,
          waterUsage: supplier.waterUsage,
          ISO14001: supplier.ISO14001,
          recyclingPolicy: supplier.recyclingPolicy,
          wasteReduction: supplier.wasteReduction,
          energyEfficiency: supplier.energyEfficiency,
          waterPolicy: supplier.waterPolicy,
          sustainabilityReport: supplier.sustainabilityReport,
          location: supplier.location,
          employeeCount: supplier.employeeCount,
        });
      }
    },
  });

  const form = useForm<UpdateSupplierForm>({
    resolver: zodResolver(updateSupplierSchema),
    defaultValues: {
      name: "",
      carbonFootprint: 0,
      waterUsage: 0,
      ISO14001: false,
      recyclingPolicy: false,
      wasteReduction: 0,
      energyEfficiency: 0,
      waterPolicy: false,
      sustainabilityReport: false,
      location: "",
      employeeCount: 0,
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async (data: UpdateSupplierForm) => {
      if (!mySupplier || mySupplier.length === 0) {
        throw new Error("No supplier data found");
      }

      const supplierId = mySupplier[0].id;

      // Generate some basic historical data and calculate risk score for updates
      const historicalCarbon = Array.from({ length: 12 }, (_, i) =>
        Math.round(data.carbonFootprint * (1 + (Math.random() - 0.5) * 0.2))
      );

      let riskScore = 50; // Base score
      if (data.carbonFootprint > 3000) riskScore += 20;
      else if (data.carbonFootprint < 1500) riskScore -= 15;

      if (data.waterUsage > 2000) riskScore += 15;
      else if (data.waterUsage < 1000) riskScore -= 10;

      if (data.ISO14001) riskScore -= 15;
      if (data.recyclingPolicy) riskScore -= 10;

      riskScore = Math.max(0, Math.min(100, riskScore));

      const updateData = {
        name: data.name,
        carbonFootprint: data.carbonFootprint,
        waterUsage: data.waterUsage,
        ISO14001: data.ISO14001,
        recyclingPolicy: data.recyclingPolicy,
        wasteReduction: data.wasteReduction,
        energyEfficiency: data.energyEfficiency,
        waterPolicy: data.waterPolicy,
        sustainabilityReport: data.sustainabilityReport,
        location: data.location,
        employeeCount: data.employeeCount,
        riskScore,
        historicalCarbon,
      };

      return apiRequest("PATCH", `/api/suppliers/${supplierId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Profile updated successfully!",
        description: "Your supplier information has been updated.",
      });
      setLocation("/supplier/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const progress = (currentStep / 10) * 100;

  const nextStep = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: UpdateSupplierForm) => {
    updateSupplierMutation.mutate(data);
  };

  if (supplierLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your supplier information...</p>
        </div>
      </div>
    );
  }

  if (!mySupplier || mySupplier.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertDescription>
              No supplier information found. Please contact your administrator to set up your supplier profile.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-2">
              Update Supplier Profile
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Keep your sustainability information up to date
            </p>

            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep} of 10
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Company Name */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Company Information</h2>
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter your company name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location">Company Location</Label>
                    <Input
                      id="location"
                      {...form.register("location")}
                      placeholder="Enter company location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      min="1"
                      {...form.register("employeeCount", { valueAsNumber: true })}
                      placeholder="Enter number of employees"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Carbon Footprint */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Environmental Metrics</h2>
                  <div>
                    <Label htmlFor="carbonFootprint">Carbon Footprint (tons/year)</Label>
                    <Input
                      id="carbonFootprint"
                      type="number"
                      {...form.register("carbonFootprint", { valueAsNumber: true })}
                      placeholder="Enter carbon footprint in tons"
                    />
                    {form.formState.errors.carbonFootprint && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.carbonFootprint.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Water Usage */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="waterUsage">Water Usage (liters/month)</Label>
                    <Input
                      id="waterUsage"
                      type="number"
                      {...form.register("waterUsage", { valueAsNumber: true })}
                      placeholder="Enter water usage in liters"
                    />
                    {form.formState.errors.waterUsage && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.waterUsage.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Certifications */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Certifications</h2>
                  <div>
                    <Label>ISO 14001 Certification</Label>
                    <RadioGroup
                      value={form.watch("ISO14001")?.toString()}
                      onValueChange={(value) => form.setValue("ISO14001", value === "true")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="iso-yes" />
                        <Label htmlFor="iso-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="iso-no" />
                        <Label htmlFor="iso-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 5: Policies */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Environmental Policies</h2>
                  <div>
                    <Label>Recycling Program</Label>
                    <RadioGroup
                      value={form.watch("recyclingPolicy")?.toString()}
                      onValueChange={(value) => form.setValue("recyclingPolicy", value === "true")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="recycling-yes" />
                        <Label htmlFor="recycling-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="recycling-no" />
                        <Label htmlFor="recycling-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Water Policy</Label>
                    <RadioGroup
                      value={form.watch("waterPolicy")?.toString()}
                      onValueChange={(value) => form.setValue("waterPolicy", value === "true")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="water-yes" />
                        <Label htmlFor="water-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="water-no" />
                        <Label htmlFor="water-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 6: Sustainability Report */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Reporting</h2>
                  <div>
                    <Label>Sustainability Reports</Label>
                    <RadioGroup
                      value={form.watch("sustainabilityReport")?.toString()}
                      onValueChange={(value) => form.setValue("sustainabilityReport", value === "true")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="report-yes" />
                        <Label htmlFor="report-yes">Yes, we publish annual reports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="report-no" />
                        <Label htmlFor="report-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 7: Waste Reduction */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Performance Metrics</h2>
                  <div>
                    <Label htmlFor="wasteReduction">Waste Reduction (%)</Label>
                    <Input
                      id="wasteReduction"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("wasteReduction", { valueAsNumber: true })}
                      placeholder="Enter percentage (0-100)"
                    />
                  </div>
                </div>
              )}

              {/* Step 8: Energy Efficiency */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="energyEfficiency">Energy Efficiency (%)</Label>
                    <Input
                      id="energyEfficiency"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("energyEfficiency", { valueAsNumber: true })}
                      placeholder="Enter percentage (0-100)"
                    />
                  </div>
                </div>
              )}

              {/* Step 9: Review */}
              {currentStep === 9 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Review Your Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Company:</span>
                      <span className="font-medium">{form.watch("name")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{form.watch("location")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Footprint:</span>
                      <span className="font-medium">{form.watch("carbonFootprint")} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ISO 14001:</span>
                      <span className="font-medium">{form.watch("ISO14001") ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recycling Policy:</span>
                      <span className="font-medium">{form.watch("recyclingPolicy") ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 10: Success */}
              {currentStep === 10 && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h2 className="text-xl font-semibold">Ready to Update!</h2>
                  <p className="text-muted-foreground">
                    Click submit to save your updated supplier information.
                  </p>
                </div>
              )}

              {/* Form Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className={currentStep === 1 ? "invisible" : ""}
                >
                  Previous
                </Button>

                {currentStep < 9 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : currentStep === 9 ? (
                  <Button type="button" onClick={() => setCurrentStep(10)}>
                    Review
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={updateSupplierMutation.isPending}
                  >
                    {updateSupplierMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

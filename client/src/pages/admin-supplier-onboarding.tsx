import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSupplierSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { UserPlus, CheckCircle } from "lucide-react";

const onboardingSchema = insertSupplierSchema.omit({ 
  historicalCarbon: true,
  riskScore: true 
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function AdminSupplierOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
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

  const createSupplierMutation = useMutation({
    mutationFn: async (data: OnboardingForm) => {
      // Generate some basic historical data and calculate risk score
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
      
      const supplierData = {
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

      const response = await apiRequest("POST", "/api/suppliers", supplierData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Supplier registered successfully!",
        description: "The company has been added to the supplier database.",
      });
      setLocation("/admin/suppliers");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
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

  const onSubmit = (data: OnboardingForm) => {
    createSupplierMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-2 flex items-center justify-center" data-testid="onboarding-title">
              <UserPlus className="h-8 w-8 mr-3 text-blue-500" />
              Add New Supplier
            </CardTitle>
            <p className="text-gray-600 text-center">Complete the questionnaire to register a new supplier</p>
            
            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600" data-testid="step-indicator">
                  Step {currentStep} of 10
                </span>
                <span className="text-sm font-medium text-gray-600" data-testid="progress-percent">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="w-full h-2" data-testid="progress-bar" />
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Company Name */}
              {currentStep === 1 && (
                <div className="space-y-4" data-testid="step-1">
                  <h2 className="text-xl font-semibold text-gray-900">What is the company's name?</h2>
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Company Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter company name"
                      data-testid="input-company-name"
                      className="mt-1"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Carbon Footprint */}
              {currentStep === 2 && (
                <div className="space-y-4" data-testid="step-2">
                  <h2 className="text-xl font-semibold text-gray-900">What is their total carbon footprint (in tons)?</h2>
                  <div>
                    <Label htmlFor="carbonFootprint" className="text-sm font-medium text-gray-700">Carbon Footprint (tons)</Label>
                    <Input
                      id="carbonFootprint"
                      type="number"
                      {...form.register("carbonFootprint", { valueAsNumber: true })}
                      placeholder="Enter carbon footprint in tons"
                      data-testid="input-carbon-footprint"
                      className="mt-1"
                    />
                    {form.formState.errors.carbonFootprint && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.carbonFootprint.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: ISO 14001 Certification */}
              {currentStep === 3 && (
                <div className="space-y-4" data-testid="step-3">
                  <h2 className="text-xl font-semibold text-gray-900">Do they have an ISO 14001 certification?</h2>
                  <RadioGroup
                    value={form.watch("ISO14001")?.toString()}
                    onValueChange={(value) => form.setValue("ISO14001", value === "true")}
                    data-testid="radio-iso14001"
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="true" id="iso-yes" />
                      <Label htmlFor="iso-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="false" id="iso-no" />
                      <Label htmlFor="iso-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.ISO14001 && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.ISO14001.message}</p>
                  )}
                </div>
              )}

              {/* Step 4: Water Usage */}
              {currentStep === 4 && (
                <div className="space-y-4" data-testid="step-4">
                  <h2 className="text-xl font-semibold text-gray-900">What is their water usage (in liters per month)?</h2>
                  <div>
                    <Label htmlFor="waterUsage" className="text-sm font-medium text-gray-700">Water Usage (L/month)</Label>
                    <Input
                      id="waterUsage"
                      type="number"
                      {...form.register("waterUsage", { valueAsNumber: true })}
                      placeholder="Enter water usage in liters"
                      data-testid="input-water-usage"
                      className="mt-1"
                    />
                    {form.formState.errors.waterUsage && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.waterUsage.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Recycling Program */}
              {currentStep === 5 && (
                <div className="space-y-4" data-testid="step-5">
                  <h2 className="text-xl font-semibold text-gray-900">Do they have a recycling program?</h2>
                  <RadioGroup
                    value={form.watch("recyclingPolicy")?.toString()}
                    onValueChange={(value) => form.setValue("recyclingPolicy", value === "true")}
                    data-testid="radio-recycling"
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="true" id="recycling-yes" />
                      <Label htmlFor="recycling-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="false" id="recycling-no" />
                      <Label htmlFor="recycling-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.recyclingPolicy && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.recyclingPolicy.message}</p>
                  )}
                </div>
              )}

              {/* Step 6: Water Policy */}
              {currentStep === 6 && (
                <div className="space-y-4" data-testid="step-6">
                  <h2 className="text-xl font-semibold text-gray-900">Do they have a publicly available water policy?</h2>
                  <RadioGroup
                    value={form.watch("waterPolicy")?.toString()}
                    onValueChange={(value) => form.setValue("waterPolicy", value === "true")}
                    data-testid="radio-water-policy"
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="true" id="water-policy-yes" />
                      <Label htmlFor="water-policy-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="false" id="water-policy-no" />
                      <Label htmlFor="water-policy-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 7: Waste Reduction */}
              {currentStep === 7 && (
                <div className="space-y-4" data-testid="step-7">
                  <h2 className="text-xl font-semibold text-gray-900">What percentage of waste do they reduce annually?</h2>
                  <div>
                    <Label htmlFor="wasteReduction" className="text-sm font-medium text-gray-700">Waste Reduction (%)</Label>
                    <Input
                      id="wasteReduction"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("wasteReduction", { valueAsNumber: true })}
                      placeholder="Enter percentage (0-100)"
                      data-testid="input-waste-reduction"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 8: Energy Efficiency */}
              {currentStep === 8 && (
                <div className="space-y-4" data-testid="step-8">
                  <h2 className="text-xl font-semibold text-gray-900">What is their energy efficiency rating?</h2>
                  <div>
                    <Label htmlFor="energyEfficiency" className="text-sm font-medium text-gray-700">Energy Efficiency (%)</Label>
                    <Input
                      id="energyEfficiency"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("energyEfficiency", { valueAsNumber: true })}
                      placeholder="Enter percentage (0-100)"
                      data-testid="input-energy-efficiency"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 9: Sustainability Report */}
              {currentStep === 9 && (
                <div className="space-y-4" data-testid="step-9">
                  <h2 className="text-xl font-semibold text-gray-900">Do they publish annual sustainability reports?</h2>
                  <RadioGroup
                    value={form.watch("sustainabilityReport")?.toString()}
                    onValueChange={(value) => form.setValue("sustainabilityReport", value === "true")}
                    data-testid="radio-sustainability-report"
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="true" id="report-yes" />
                      <Label htmlFor="report-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <RadioGroupItem value="false" id="report-no" />
                      <Label htmlFor="report-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 10: Company Details */}
              {currentStep === 10 && (
                <div className="space-y-4" data-testid="step-10">
                  <h2 className="text-xl font-semibold text-gray-900">Company Details</h2>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Company Location</Label>
                    <Input
                      id="location"
                      {...form.register("location")}
                      placeholder="Enter company location (e.g., California, USA)"
                      data-testid="input-location"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeCount" className="text-sm font-medium text-gray-700">Number of Employees</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      min="1"
                      {...form.register("employeeCount", { valueAsNumber: true })}
                      placeholder="Enter number of employees"
                      data-testid="input-employee-count"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Form Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className={`${currentStep === 1 ? "invisible" : ""} px-6`}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
                
                {currentStep < 10 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    data-testid="button-next"
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createSupplierMutation.isPending}
                    data-testid="button-submit"
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    {createSupplierMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Add Supplier
                      </>
                    )}
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
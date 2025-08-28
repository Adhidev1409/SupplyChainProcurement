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

const onboardingSchema = insertSupplierSchema.extend({
  companyName: z.string().min(1, "Company name is required"),
}).omit({ 
  historicalCarbon: true 
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
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
      riskScore: 0,
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
        description: "Your company has been added to our supplier database.",
      });
      setLocation("/procurement/suppliers");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const progress = (currentStep / 5) * 100;

  const nextStep = () => {
    if (currentStep < 5) {
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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-2" data-testid="onboarding-title">
              Supplier Onboarding
            </CardTitle>
            <p className="text-muted-foreground text-center">Complete the form to register as a new supplier</p>
            
            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground" data-testid="step-indicator">
                  Step {currentStep} of 5
                </span>
                <span className="text-sm font-medium text-muted-foreground" data-testid="progress-percent">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="w-full" data-testid="progress-bar" />
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Company Name */}
              {currentStep === 1 && (
                <div className="space-y-4" data-testid="step-1">
                  <h2 className="text-xl font-semibold">What is your company's name?</h2>
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter your company name"
                      data-testid="input-company-name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Carbon Footprint */}
              {currentStep === 2 && (
                <div className="space-y-4" data-testid="step-2">
                  <h2 className="text-xl font-semibold">What is your total carbon footprint (in tons)?</h2>
                  <div>
                    <Label htmlFor="carbonFootprint">Carbon Footprint (tons)</Label>
                    <Input
                      id="carbonFootprint"
                      type="number"
                      {...form.register("carbonFootprint", { valueAsNumber: true })}
                      placeholder="Enter carbon footprint in tons"
                      data-testid="input-carbon-footprint"
                    />
                    {form.formState.errors.carbonFootprint && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.carbonFootprint.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: ISO 14001 Certification */}
              {currentStep === 3 && (
                <div className="space-y-4" data-testid="step-3">
                  <h2 className="text-xl font-semibold">Do you have an ISO 14001 certification?</h2>
                  <RadioGroup
                    value={form.watch("ISO14001")?.toString()}
                    onValueChange={(value) => form.setValue("ISO14001", value === "true")}
                    data-testid="radio-iso14001"
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
                  {form.formState.errors.ISO14001 && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.ISO14001.message}</p>
                  )}
                </div>
              )}

              {/* Step 4: Water Usage */}
              {currentStep === 4 && (
                <div className="space-y-4" data-testid="step-4">
                  <h2 className="text-xl font-semibold">What is your water usage (in liters per month)?</h2>
                  <div>
                    <Label htmlFor="waterUsage">Water Usage (L/month)</Label>
                    <Input
                      id="waterUsage"
                      type="number"
                      {...form.register("waterUsage", { valueAsNumber: true })}
                      placeholder="Enter water usage in liters"
                      data-testid="input-water-usage"
                    />
                    {form.formState.errors.waterUsage && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.waterUsage.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Recycling Program */}
              {currentStep === 5 && (
                <div className="space-y-4" data-testid="step-5">
                  <h2 className="text-xl font-semibold">Do you have a recycling program?</h2>
                  <RadioGroup
                    value={form.watch("recyclingPolicy")?.toString()}
                    onValueChange={(value) => form.setValue("recyclingPolicy", value === "true")}
                    data-testid="radio-recycling"
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
                  {form.formState.errors.recyclingPolicy && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.recyclingPolicy.message}</p>
                  )}
                </div>
              )}

              {/* Form Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className={currentStep === 1 ? "invisible" : ""}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
                
                {currentStep < 5 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createSupplierMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createSupplierMutation.isPending ? "Submitting..." : "Submit"}
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

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { getQueryFn } from "@/lib/queryClient";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";

const onboardingSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  productCategory: z.string().min(1, "Product category is required"),
  carbonFootprint: z.number().min(0),
  waterUsage: z.number().min(0),
  wasteGeneration: z.number().min(0),
  wasteReduction: z.number().min(0).max(100).optional().default(0),
  energyEfficiency: z.number().min(0).max(100),
  laborPractices: z.number().min(0).max(100),
  transportCostPerUnit: z.number().min(0),
  onTimeDelivery: z.number().min(0).max(100),
  regulatoryFlags: z.number().min(0),
  leadTimeDays: z.number().min(0),
  ISO14001: z.boolean(),
  recyclingPolicy: z.boolean().optional().default(false),
  waterPolicy: z.boolean().optional().default(false),
  sustainabilityReport: z.boolean().optional().default(false),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [existingSupplierId, setExistingSupplierId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const meQuery = useQuery({ queryKey: ["/api/auth/me"], queryFn: getQueryFn({ on401: "returnNull" }) });
  const isSupplier = !!(meQuery.data && (meQuery.data as any).user && (meQuery.data as any).user.role === 'supplier');
  const mySuppliersQuery = useQuery({
    queryKey: ["/api/my-suppliers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isSupplier,
    select: (d) => (Array.isArray((d as any)) ? (d as any) : []),
  });
  
  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      productCategory: "",
      carbonFootprint: 0,
      waterUsage: 0,
      wasteGeneration: 0,
      wasteReduction: 0,
      energyEfficiency: 50,
      laborPractices: 50,
      transportCostPerUnit: 0,
      onTimeDelivery: 80,
      regulatoryFlags: 0,
      leadTimeDays: 30,
      ISO14001: false,
      recyclingPolicy: false,
      waterPolicy: false,
      sustainabilityReport: false,
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: OnboardingForm & { id?: number }) => {
      // If an ID exists, update instead of creating (supplier self-update)
      if ((data as any).id) {
        const response = await apiRequest("PATCH", `/api/suppliers/${(data as any).id}`, data);
        return response.json();
      }

      const response = await apiRequest("POST", "/api/suppliers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Supplier registered successfully!",
        description: "Your company has been added to our supplier database.",
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

  const onSubmit = (data: OnboardingForm) => {
    createSupplierMutation.mutate(existingSupplierId ? { ...data, id: existingSupplierId } : data);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Prefill supplier data for supplier users
  useEffect(() => {
    if (isSupplier && Array.isArray(mySuppliersQuery.data) && mySuppliersQuery.data.length > 0) {
      const s = mySuppliersQuery.data[0];
      setExistingSupplierId(s.id);
      form.reset({
        name: s.name,
        productCategory: s.productCategory,
        carbonFootprint: s.carbonFootprint,
        waterUsage: s.waterUsage,
        wasteGeneration: s.wasteGeneration ?? 0,
        wasteReduction: s.wasteReduction ?? 0,
        energyEfficiency: s.energyEfficiency,
        laborPractices: s.laborPractices,
        transportCostPerUnit: s.transportCostPerUnit,
        onTimeDelivery: s.onTimeDelivery,
        regulatoryFlags: s.regulatoryFlags,
        leadTimeDays: s.leadTimeDays,
        ISO14001: s.ISO14001,
        recyclingPolicy: s.recyclingPolicy ?? false,
        waterPolicy: s.waterPolicy ?? false,
        sustainabilityReport: s.sustainabilityReport ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupplier, mySuppliersQuery.data]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Supplier Onboarding</h1>
          <p className="text-muted-foreground">
            Complete the registration process to join our supplier network
          </p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Company Information"}
              {currentStep === 2 && "Environmental Metrics"}
              {currentStep === 3 && "Operational Metrics"}
              {currentStep === 4 && "Review & Submit"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter company name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="productCategory">Product Category</Label>
                    <Select
                      value={form.watch("productCategory")}
                      onValueChange={(value) => form.setValue("productCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="textiles">Textiles</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="chemicals">Chemicals</SelectItem>
                        <SelectItem value="packaging">Packaging</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.productCategory && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.productCategory.message}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="carbonFootprint">Carbon Footprint (tons CO2/year)</Label>
                    <Input
                      id="carbonFootprint"
                      type="number"
                      {...form.register("carbonFootprint", { valueAsNumber: true })}
                      placeholder="Enter annual carbon footprint"
                    />
                  </div>

                  <div>
                    <Label htmlFor="waterUsage">Water Usage (liters/year)</Label>
                    <Input
                      id="waterUsage"
                      type="number"
                      {...form.register("waterUsage", { valueAsNumber: true })}
                      placeholder="Enter annual water usage"
                    />
                  </div>

                  <div>
                    <Label htmlFor="wasteGeneration">Waste Generation (tons/year)</Label>
                    <Input
                      id="wasteGeneration"
                      type="number"
                      {...form.register("wasteGeneration", { valueAsNumber: true })}
                      placeholder="Enter annual waste generation"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ISO14001"
                      checked={form.watch("ISO14001")}
                      onCheckedChange={(checked) => form.setValue("ISO14001", !!checked)}
                    />
                    <Label htmlFor="ISO14001">ISO 14001 Certified</Label>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="energyEfficiency">Energy Efficiency Score (0-100)</Label>
                    <Input
                      id="energyEfficiency"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("energyEfficiency", { valueAsNumber: true })}
                      placeholder="Enter energy efficiency score"
                    />
                  </div>

                  <div>
                    <Label htmlFor="laborPractices">Labor Practices Score (0-100)</Label>
                    <Input
                      id="laborPractices"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("laborPractices", { valueAsNumber: true })}
                      placeholder="Enter labor practices score"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transportCostPerUnit">Transport Cost per Unit ($)</Label>
                    <Input
                      id="transportCostPerUnit"
                      type="number"
                      step="0.01"
                      {...form.register("transportCostPerUnit", { valueAsNumber: true })}
                      placeholder="Enter transport cost per unit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="onTimeDelivery">On-Time Delivery Rate (%)</Label>
                    <Input
                      id="onTimeDelivery"
                      type="number"
                      min="0"
                      max="100"
                      {...form.register("onTimeDelivery", { valueAsNumber: true })}
                      placeholder="Enter on-time delivery percentage"
                    />
                  </div>

                  <div>
                    <Label htmlFor="regulatoryFlags">Regulatory Flags (count)</Label>
                    <Input
                      id="regulatoryFlags"
                      type="number"
                      min="0"
                      {...form.register("regulatoryFlags", { valueAsNumber: true })}
                      placeholder="Enter number of regulatory flags"
                    />
                  </div>

                  <div>
                    <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
                    <Input
                      id="leadTimeDays"
                      type="number"
                      min="0"
                      {...form.register("leadTimeDays", { valueAsNumber: true })}
                      placeholder="Enter average lead time in days"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Company:</strong> {form.watch("name")}</div>
                    <div><strong>Category:</strong> {form.watch("productCategory")}</div>
                    <div><strong>Carbon Footprint:</strong> {form.watch("carbonFootprint")} tons/year</div>
                    <div><strong>Water Usage:</strong> {form.watch("waterUsage")} L/year</div>
                    <div><strong>Energy Efficiency:</strong> {form.watch("energyEfficiency")}/100</div>
                    <div><strong>Labor Practices:</strong> {form.watch("laborPractices")}/100</div>
                    <div><strong>Transport Cost:</strong> ${form.watch("transportCostPerUnit")}/unit</div>
                    <div><strong>On-Time Delivery:</strong> {form.watch("onTimeDelivery")}%</div>
                    <div><strong>Lead Time:</strong> {form.watch("leadTimeDays")} days</div>
                    <div><strong>ISO 14001:</strong> {form.watch("ISO14001") ? "Yes" : "No"}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createSupplierMutation.isPending}
                    className="ml-auto"
                  >
                    {createSupplierMutation.isPending ? "Submitting..." : "Complete Registration"}
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
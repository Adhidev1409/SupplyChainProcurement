import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";
import HomePage from "@/pages/home";
import OnboardingPage from "@/pages/onboarding";
import ProcurementDashboard from "@/pages/procurement-dashboard";
import SuppliersListPage from "@/pages/suppliers-list";
import SupplierDetailPage from "@/pages/supplier-detail";
import SimulationPage from "@/pages/simulation";
import SupplierPortalPage from "@/pages/supplier-portal";
import WeightsConfigPage from "@/pages/weights-config";
import QuestionnaireResultsPage from "@/pages/questionnaire-results";
import RiskMapPage from "@/pages/risk-map";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/procurement" component={ProcurementDashboard} />
        <Route path="/procurement/suppliers" component={SuppliersListPage} />
        <Route path="/procurement/suppliers/:id" component={SupplierDetailPage} />
        <Route path="/procurement/simulator" component={SimulationPage} />
        <Route path="/procurement/weights-config" component={WeightsConfigPage} />
        <Route path="/procurement/questionnaire-results" component={QuestionnaireResultsPage} />
        <Route path="/procurement/risk-map" component={RiskMapPage} />
        <Route path="/supplier" component={SupplierPortalPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

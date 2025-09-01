import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import AdminNavigation from "@/components/admin-navigation";
import SupplierNavigation from "@/components/supplier-navigation";
import AdminDashboard from "@/pages/admin-dashboard";
import SupplierDashboard from "@/pages/supplier-dashboard";
import SuppliersListPage from "@/pages/suppliers-list";
import SupplierDetailPage from "@/pages/supplier-detail";
import OnboardingPage from "@/pages/onboarding";
import SupplierPortalPage from "@/pages/supplier-portal";
import WeightsConfigPage from "@/pages/weights-config";
import AdminRiskMapPage from "@/pages/admin-risk-map";
import AdminSimulationPage from "@/pages/admin-simulation";
import AdminQuestionnaireResultsPage from "@/pages/admin-questionnaire-results";
import RiskMapPage from "@/pages/risk-map";
import SimulationPage from "@/pages/simulation";
import QuestionnaireResultsPage from "@/pages/questionnaire-results";
import ProcurementDashboard from "@/pages/procurement-dashboard";
import { Loader2 } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

// User context type
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'supplier';
  email: string;
  supplierId?: string;
}

function ProtectedRoute({
  component: Component,
  allowedRoles,
  user,
  ...props
}: {
  component: React.ComponentType<any>;
  allowedRoles: string[];
  user: User | null;
  [key: string]: any;
}) {
  if (!user) {
    return <LoginPage />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <Component {...props} />;
}

function Router() {
  const [user, setUser] = useState<User | null>(null);
  const [location, navigate] = useLocation();

  const { isLoading, data } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
    retry: false,
  });

  // Handle auth state changes
  useEffect(() => {
    if (data && (data as any).user) {
      setUser((data as any).user);
      if (location === '/login' || location === '/') {
        navigate((data as any).user.role === 'admin' ? '/admin/dashboard' : '/supplier/dashboard');
      }
    } else if (data === null) {
      setUser(null);
      if (location !== '/login') {
        navigate('/login');
      }
    }
  }, [data, location, navigate]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      queryClient.clear();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <>
          {user.role === 'admin' ? (
            <AdminNavigation user={user} onLogout={handleLogout} />
          ) : (
            <SupplierNavigation user={user} onLogout={handleLogout} />
          )}
        </>
      )}

      <Switch>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />

        {/* Admin routes */}
        <Route path="/admin/dashboard">
          <ProtectedRoute
            component={AdminDashboard}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin">
          <ProtectedRoute
            component={AdminDashboard}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/suppliers">
          <ProtectedRoute
            component={SuppliersListPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/suppliers/:id">
          <ProtectedRoute
            component={SupplierDetailPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/weights-config">
          <ProtectedRoute
            component={WeightsConfigPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/risk-map">
          <ProtectedRoute
            component={AdminRiskMapPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/simulation">
          <ProtectedRoute
            component={AdminSimulationPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/onboarding">
          <ProtectedRoute
            component={OnboardingPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/admin/questionnaire-results">
          <ProtectedRoute
            component={AdminQuestionnaireResultsPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>

        {/* Procurement routes (shared between admin and procurement users) */}
        <Route path="/procurement">
          <ProtectedRoute
            component={ProcurementDashboard}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/procurement/suppliers">
          <ProtectedRoute
            component={SuppliersListPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/procurement/suppliers/:id">
          <ProtectedRoute
            component={SupplierDetailPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/procurement/risk-map">
          <ProtectedRoute
            component={RiskMapPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/procurement/simulation">
          <ProtectedRoute
            component={SimulationPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>
        <Route path="/procurement/questionnaire-results">
          <ProtectedRoute
            component={QuestionnaireResultsPage}
            allowedRoles={['admin']}
            user={user}
          />
        </Route>

        {/* Supplier routes */}
        <Route path="/supplier/dashboard">
          <ProtectedRoute
            component={SupplierDashboard}
            allowedRoles={['supplier']}
            user={user}
          />
        </Route>
        <Route path="/supplier/onboarding">
          <ProtectedRoute
            component={OnboardingPage}
            allowedRoles={['supplier']}
            user={user}
          />
        </Route>
        <Route path="/supplier/portal">
          <ProtectedRoute
            component={SupplierPortalPage}
            allowedRoles={['supplier']}
            user={user}
          />
        </Route>

        {/* Default redirect */}
        <Route path="/" component={LoginPage} />

        {/* 404 */}
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

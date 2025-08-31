import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [, setLocation] = useLocation();

  // Avoid calling `/api/auth/me` again — rely on app-level auth check.
  const authData = null;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!authData?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-foreground mb-6">
              Sustainable Supply Chain
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Optimize your procurement decisions with comprehensive sustainability analytics
            </p>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Welcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Please sign in to access the application.
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <strong>Admin:</strong><br />
                    admin / admin123
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <strong>Supplier:</strong><br />
                    greensupply / supplier123
                  </div>
                </div>

                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null; // This shouldn't render if redirects work properly
}

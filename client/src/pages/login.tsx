import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { loginSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // We intentionally do NOT fetch `/api/auth/me` here to avoid duplicate
  // requests — the app-level Router performs the single authentication
  // check. Keep the login page lightweight and only perform login
  // mutations.
  const isCheckingAuth = false;

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Login successful!",
        description: `Welcome back, ${data.user.username}`,
      });

      // Invalidate auth query so Router picks up new session
      try {
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      } catch (e) {
        // ignore
      }

      // Do a hard reload so the app picks up the new session and updates UI
      if (data.user.role === 'admin') {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/supplier/dashboard";
      }
    },
    onError: (error: any) => {
      setError(error.message || "Login failed. Please check your credentials.");
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError(null);
    loginMutation.mutate(data);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <p className="text-muted-foreground">Sign in to your account</p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  {...form.register("username")}
                  placeholder="Enter your username"
                  disabled={loginMutation.isPending}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Test Credentials:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Supplier:</strong> greensupply / supplier123</p>
                <p><strong>Supplier:</strong> ecotech / supplier123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

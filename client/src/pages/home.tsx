import { Link } from "wouter";
import { BarChart, Globe, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-foreground mb-6" data-testid="hero-title">
            Sustainable Supply Chain
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto" data-testid="hero-description">
            Optimize your procurement decisions with comprehensive sustainability analytics and supplier performance insights
          </p>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/procurement">
              <button 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                data-testid="button-procurement"
              >
                Enter Procurement Dashboard
              </button>
            </Link>
            <Link href="/supplier">
              <button 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                data-testid="button-supplier"
              >
                Are you a Supplier?
              </button>
            </Link>
            <Link href="/onboarding">
              <button 
                className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg border border-border"
                data-testid="button-signup"
              >
                New Supplier? Sign Up
              </button>
            </Link>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border" data-testid="feature-analytics">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <BarChart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-muted-foreground">Comprehensive dashboards with real-time sustainability metrics and performance insights</p>
          </div>
          
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border" data-testid="feature-management">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Supplier Management</h3>
            <p className="text-muted-foreground">Streamlined onboarding and comprehensive supplier performance tracking</p>
          </div>
          
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border" data-testid="feature-simulation">
            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Impact Simulation</h3>
            <p className="text-muted-foreground">What-if analysis tools for evaluating environmental impact of procurement decisions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

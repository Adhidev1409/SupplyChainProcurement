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
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link href="/procurement">
              <button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                data-testid="button-procurement"
              >
                <div className="text-center">
                  <div className="text-xl mb-2">📊 Procurement Dashboard</div>
                  <div className="text-sm opacity-90">View sustainability metrics and supplier analytics</div>
                </div>
              </button>
            </Link>
            <Link href="/procurement/simulator">
              <button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                data-testid="button-simulator"
              >
                <div className="text-center">
                  <div className="text-xl mb-2">🎯 Impact Simulator</div>
                  <div className="text-sm opacity-90">Compare environmental impact of suppliers</div>
                </div>
              </button>
            </Link>
          </div>
          
          {/* Secondary Actions */}
          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto mt-12">
            <Link href="/procurement/suppliers">
              <button 
                className="w-full bg-card hover:bg-muted text-card-foreground px-6 py-4 rounded-lg font-medium transition-colors shadow border border-border"
                data-testid="button-suppliers"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">📋 Supplier Directory</div>
                  <div className="text-sm text-muted-foreground">Browse and filter suppliers</div>
                </div>
              </button>
            </Link>
            <Link href="/procurement/risk-map">
              <button 
                className="w-full bg-card hover:bg-muted text-card-foreground px-6 py-4 rounded-lg font-medium transition-colors shadow border border-border"
                data-testid="button-risk-map"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">🗺️ Risk Map</div>
                  <div className="text-sm text-muted-foreground">Geographic risk assessment</div>
                </div>
              </button>
            </Link>
            <Link href="/procurement/questionnaire-results">
              <button 
                className="w-full bg-card hover:bg-muted text-card-foreground px-6 py-4 rounded-lg font-medium transition-colors shadow border border-border"
                data-testid="button-questionnaire"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">📊 Questionnaire Results</div>
                  <div className="text-sm text-muted-foreground">Review supplier responses</div>
                </div>
              </button>
            </Link>
          </div>
          
          {/* Additional Tools */}
          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto mt-8">
            <Link href="/procurement/weights-config">
              <button 
                className="w-full bg-card hover:bg-muted text-card-foreground px-6 py-4 rounded-lg font-medium transition-colors shadow border border-border"
                data-testid="button-weights"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">⚖️ Scoring Weights</div>
                  <div className="text-sm text-muted-foreground">Configure sustainability metrics</div>
                </div>
              </button>
            </Link>
            <Link href="/supplier">
              <button 
                className="w-full bg-card hover:bg-muted text-card-foreground px-6 py-4 rounded-lg font-medium transition-colors shadow border border-border"
                data-testid="button-supplier"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">🏢 Supplier Portal</div>
                  <div className="text-sm text-muted-foreground">View your performance metrics</div>
                </div>
              </button>
            </Link>
            <Link href="/onboarding">
              <button 
                className="w-full bg-card hover:bg-muted text-card-foreground px-6 py-4 rounded-lg font-medium transition-colors shadow border border-border"
                data-testid="button-signup"
              >
                <div className="text-center">
                  <div className="text-lg mb-1">📝 New Supplier Registration</div>
                  <div className="text-sm text-muted-foreground">Join our supplier network</div>
                </div>
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

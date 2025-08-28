import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/procurement", label: "Dashboard" },
    { href: "/procurement/suppliers", label: "Suppliers" },
    { href: "/procurement/simulator", label: "Simulator" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/supplier", label: "Supplier Portal" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary cursor-pointer" data-testid="logo">
                  EcoSupply
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors",
                        location === item.href ? "bg-muted text-foreground" : "text-muted-foreground"
                      )}
                      data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

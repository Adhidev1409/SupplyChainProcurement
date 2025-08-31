import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/App";
import {
  LayoutDashboard,
  FileText,
  User as UserIcon,
  LogOut,
  Building,
  ChevronDown
} from "lucide-react";

interface SupplierNavigationProps {
  user: User;
  onLogout: () => void;
}

export default function SupplierNavigation({ user, onLogout }: SupplierNavigationProps) {
  const [location] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/supplier/dashboard",
      icon: LayoutDashboard,
      current: location === "/supplier/dashboard",
    },
    {
      name: "My Portal",
      href: "/supplier/portal",
      icon: Building,
      current: location === "/supplier/portal",
    },
    {
      name: "Onboarding",
      href: "/supplier/onboarding",
      icon: FileText,
      current: location === "/supplier/onboarding",
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Building className="h-8 w-8 text-primary" />
              <span className="ml-3 text-xl font-bold text-gray-900">
                Supplier Portal
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`${
                      item.current
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                    } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium rounded-t-md transition-all duration-200`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 h-10 px-3 rounded-lg hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">Supplier</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-lg">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-primary font-medium">Supplier</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

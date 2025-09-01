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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/App";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  MapPin,
  Calculator,
  UserPlus,
  FileText,
  Menu,
  MoreHorizontal,
  Activity
} from "lucide-react";

interface AdminNavigationProps {
  user: User;
  onLogout: () => void;
}

export default function AdminNavigation({ user, onLogout }: AdminNavigationProps) {
  const [location] = useLocation();

  const primaryNavigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: location === "/admin",
    },
    {
      name: "Suppliers",
      href: "/admin/suppliers",
      icon: Users,
      current: location.startsWith("/admin/suppliers"),
    },
    {
      name: "Risk Map",
      href: "/admin/risk-map",
      icon: MapPin,
      current: location === "/admin/risk-map",
    },
    {
      name: "Analytics",
      href: "/admin/simulation",
      icon: Activity,
      current: location === "/admin/simulation",
    },
  ];

  const secondaryNavigation = [
    {
      name: "Add Supplier",
      href: "/admin/onboarding",
      icon: UserPlus,
      current: location === "/admin/onboarding",
    },
    {
      name: "Results",
      href: "/admin/questionnaire-results", 
      icon: FileText,
      current: location === "/admin/questionnaire-results",
    },
    {
      name: "Weights",
      href: "/admin/weights-config",
      icon: Settings,
      current: location === "/admin/weights-config",
    },
  ];

  const allNavigation = [...primaryNavigation, ...secondaryNavigation];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-3 text-xl font-bold text-gray-900">
                Admin Portal
              </span>
            </div>

            {/* Primary Navigation - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {primaryNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`${
                      item.current
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    } inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </a>
                </Link>
              ))}
              
              {/* More Menu for Secondary Items */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`${
                      secondaryNavigation.some(item => item.current)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    } inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                  >
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    More
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-2">
                  <div className="space-y-1">
                    {secondaryNavigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={`${
                            item.current
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          } flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full`}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Mobile Navigation Menu */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {allNavigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <DropdownMenuItem className={item.current ? "bg-primary/10" : ""}>
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.name}</span>
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* User Menu */}
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
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-lg">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-primary font-medium">Administrator</p>
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

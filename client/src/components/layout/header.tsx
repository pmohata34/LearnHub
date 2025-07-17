import { Link, useLocation } from "wouter";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/my-courses", label: "My Courses" },
    { href: "/browse", label: "Browse" },
    { href: "/create-course", label: "Create Course" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary font-display cursor-pointer">
                  LearnHub
                </h1>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`${
                      isActive(item.href)
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    } px-1 pb-4 text-sm font-medium transition-colors cursor-pointer`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search courses..."
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                John Doe
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

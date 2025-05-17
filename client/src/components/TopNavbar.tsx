import { Search, Bell, User, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TopNavbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = () => {
    if (!user) return "U";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center md:hidden">
            {/* Space for mobile menu button (handled by Sidebar component) */}
            <div className="w-10"></div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:block relative">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-64 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 -ml-8" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
                  <Bell className="h-6 w-6" />
                </button>

                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
                        <Avatar>
                          <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;

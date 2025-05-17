import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

const TopNavbar = () => {
  const [searchQuery, setSearchQuery] = useState("");

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

          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
              <Bell className="h-6 w-6" />
            </button>

            <div className="ml-3 relative">
              <div className="flex items-center">
                <button className="focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <Avatar>
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;

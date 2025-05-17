import { Link, useLocation } from "wouter";
import { Book, Home, Bookmark, Award, Menu, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/courses";

const Sidebar = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg md:w-64 fixed h-full z-40 transition-all duration-300 overflow-y-auto
          ${isOpen ? "left-0" : "-left-64"} md:left-0`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-primary-600">Learning Tracker</h1>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/">
                <a
                  className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
                    ${location === "/" ? "bg-gray-100 text-gray-900 font-medium" : ""}`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </a>
              </Link>
            </li>
            <li>
              <Link href="/courses">
                <a
                  className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
                    ${location.startsWith("/courses") && location !== "/courses/my-courses" ? "bg-gray-100 text-gray-900 font-medium" : ""}`}
                >
                  <Book className="h-5 w-5 mr-3" />
                  All Courses
                </a>
              </Link>
            </li>
            <li>
              <Link href="/courses/my-courses">
                <a
                  className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
                    ${location === "/courses/my-courses" ? "bg-gray-100 text-gray-900 font-medium" : ""}`}
                >
                  <Bookmark className="h-5 w-5 mr-3" />
                  My Learning
                </a>
              </Link>
            </li>
            <li>
              <Link href="/certificates">
                <a
                  className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors
                    ${location === "/certificates" ? "bg-gray-100 text-gray-900 font-medium" : ""}`}
                >
                  <Award className="h-5 w-5 mr-3" />
                  Certificates
                </a>
              </Link>
            </li>
          </ul>

          <div className="mt-8">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
            <ul className="mt-2 space-y-1">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link href={`/category/${encodeURIComponent(category.name.toLowerCase())}`}>
                    <a className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      <span className={`w-2 h-2 rounded-full ${category.color} mr-3`}></span>
                      {category.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;

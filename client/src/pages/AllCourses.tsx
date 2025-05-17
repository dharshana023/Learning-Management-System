import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import CourseCard from "@/components/CourseCard";
import { Helmet } from "react-helmet";
import { categories } from "@/lib/courses";

const AllCourses = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All");

  // Fetch all courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Filter courses by category and level
  const filteredCourses = courses?.filter((course: any) => {
    const categoryMatch = activeCategory === "All" || course.category === activeCategory;
    const levelMatch = activeLevel === "All" || course.level === activeLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Helmet>
        <title>All Courses - Learning Tracker</title>
        <meta name="description" content="Browse our complete catalog of courses. Find courses on programming, web development, data science, and more." />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <TopNavbar />
        
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600">Browse our library of courses to start learning something new</p>
            </div>
            
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeCategory === "All" 
                      ? "bg-primary-600 text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                  onClick={() => setActiveCategory("All")}
                >
                  All
                </button>
                
                {categories.map((category) => (
                  <button 
                    key={category.name}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${activeCategory === category.name 
                        ? "bg-primary-600 text-white" 
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeLevel === "All" 
                      ? "bg-primary-600 text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                  onClick={() => setActiveLevel("All")}
                >
                  All Levels
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeLevel === "Beginner" 
                      ? "bg-primary-600 text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                  onClick={() => setActiveLevel("Beginner")}
                >
                  Beginner
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeLevel === "Intermediate" 
                      ? "bg-primary-600 text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                  onClick={() => setActiveLevel("Intermediate")}
                >
                  Intermediate
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${activeLevel === "Advanced" 
                      ? "bg-primary-600 text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                  onClick={() => setActiveLevel("Advanced")}
                >
                  Advanced
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading courses...</p>
              </div>
            ) : filteredCourses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course: any) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showEnrollButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">No courses found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllCourses;

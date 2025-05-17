import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { useRequireAuth } from "@/hooks/useAuth";
import CourseCard from "@/components/CourseCard";
import { getAuthHeaders } from "@/lib/auth";

export default function MyCourses() {
  // Ensure user is authenticated
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  
  // Fetch user enrollments with course details
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/enrollments", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch enrollments");
      }
      
      return response.json();
    },
  });
  
  // Fetch user progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/progress", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      
      return response.json();
    },
  });
  
  const isLoading = authLoading || enrollmentsLoading || progressLoading;
  
  // Group progress by course
  const progressByCourse: Record<number, any[]> = {};
  if (progress) {
    progress.forEach((p: any) => {
      if (!progressByCourse[p.courseId]) {
        progressByCourse[p.courseId] = [];
      }
      progressByCourse[p.courseId].push(p);
    });
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Helmet>
        <title>My Courses - Learning Tracker</title>
        <meta name="description" content="View your enrolled courses and track your learning progress." />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <TopNavbar />
        
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600">Track your progress across enrolled courses</p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow h-80">
                    <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment: any) => (
                  <CourseCard
                    key={enrollment.courseId}
                    course={{
                      ...enrollment.course,
                      isEnrolled: true,
                    }}
                    progress={progressByCourse[enrollment.courseId] || []}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
                </p>
                <a 
                  href="/courses" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Browse Courses
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
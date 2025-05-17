
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import CourseProgress from "./CourseProgress";
import RecentlyViewed from "./RecentlyViewed";
import CourseList from "./CourseList";
import { Book, CheckCircle, Clock, Award } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: courses } = useQuery({ 
    queryKey: ["/api/courses"], 
  });
  
  const { data: progress } = useQuery({ 
    queryKey: [`/api/progress`],
    enabled: !!user,
  });
  
  const { data: recentLessons } = useQuery({ 
    queryKey: [`/api/progress/recent`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
  });
  
  // Calculate statistics
  const calculateStats = () => {
    if (!progress) return { enrolled: 0, completed: 0, hours: 0, certificates: 0 };
    
    // Get unique course IDs
    const enrolledCourses = new Set(progress.map((p: any) => p.courseId));
    
    // Count completed lessons
    const completedLessons = progress.filter((p: any) => p.completed).length;
    
    // Estimate learning hours (30 min per completed lesson)
    const learningHours = Math.round(completedLessons * 0.5 * 10) / 10;
    
    // Count courses with 100% completion
    const courseProgress = Array.from(enrolledCourses).map(courseId => {
      const courseLessons = progress.filter((p: any) => p.courseId === courseId);
      const completedCourseLessons = courseLessons.filter((p: any) => p.completed);
      return completedCourseLessons.length > 0 && completedCourseLessons.length === courseLessons.length;
    });
    
    const completedCourses = courseProgress.filter(completed => completed).length;
    
    return {
      enrolled: enrolledCourses.size,
      completed: completedLessons,
      hours: learningHours,
      certificates: completedCourses,
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}! Track your learning progress.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Enrolled Courses" 
          value={stats.enrolled.toString()} 
          change={"+1 new"} 
          icon={<Book className="h-6 w-6 text-primary-600" />} 
          bgColor="bg-primary-50" 
        />
        
        <StatsCard 
          title="Completed Lessons" 
          value={stats.completed.toString()} 
          change={"+3 this week"} 
          icon={<CheckCircle className="h-6 w-6 text-green-600" />} 
          bgColor="bg-green-50" 
        />
        
        <StatsCard 
          title="Learning Hours" 
          value={stats.hours.toString()} 
          subtext="hours" 
          icon={<Clock className="h-6 w-6 text-blue-600" />} 
          bgColor="bg-blue-50" 
        />
        
        <StatsCard 
          title="Certificates" 
          value={stats.certificates.toString()} 
          subtext="earned" 
          icon={<Award className="h-6 w-6 text-yellow-600" />} 
          bgColor="bg-yellow-50" 
        />
      </div>

      {/* Learning Progress */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h2>
        <CourseProgress progress={progress} courses={courses} />
      </div>

      {/* Recently Viewed */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Viewed</h2>
        <RecentlyViewed recentLessons={recentLessons} />
      </div>

      {/* Recommended Courses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommended Courses</h2>
          <a href="/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </a>
        </div>
        
        <CourseList
          courses={courses?.slice(4, 8)} // Showing courses that aren't in progress
          showEnrollButton={true}
        />
      </div>
    </div>
  );
};

export default Dashboard;

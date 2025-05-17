
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import CourseProgress from "./CourseProgress";
import RecentlyViewed from "./RecentlyViewed";
import CourseList from "./CourseList";
import { Book, CheckCircle, Clock, Award } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: courses, isLoading: coursesLoading } = useQuery({ 
    queryKey: ["/api/courses"],
  });
  
  const { data: progress, isLoading: progressLoading } = useQuery({ 
    queryKey: [`/api/progress`],
    enabled: !!user,
  });
  
  const { data: recentLessons, isLoading: recentLoading } = useQuery({ 
    queryKey: [`/api/progress/recent`],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user,
  });
  
  // Calculate statistics
  const calculateStats = () => {
    if (!progress || !courses) return { enrolled: 0, completed: 0, hours: 0, certificates: 0 };
    
    // Get unique course IDs from progress
    const enrolledCourses = new Set(progress.map((p: any) => p.courseId));
    
    // Count completed lessons
    const completedLessons = progress.filter((p: any) => p.completed).length;
    
    // Calculate learning hours (30 min per lesson)
    const learningHours = Math.round((completedLessons * 0.5) * 10) / 10;
    
    // Count courses with all lessons completed
    const completedCourses = Array.from(enrolledCourses).filter(courseId => {
      const courseLessons = progress.filter((p: any) => p.courseId === courseId);
      const completedCourseLessons = courseLessons.filter((p: any) => p.completed);
      return completedCourseLessons.length > 0 && completedCourseLessons.length === courseLessons.length;
    }).length;
    
    // Get new enrollments in last 7 days
    const newEnrollments = progress.filter((p: any) => {
      const enrollmentDate = new Date(p.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return enrollmentDate > weekAgo;
    });
    
    // Get completed lessons in last week
    const lastWeekCompleted = progress.filter((p: any) => {
      if (!p.completed) return false;
      const completedDate = new Date(p.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedDate > weekAgo;
    }).length;
    
    return {
      enrolled: enrolledCourses.size,
      completed: completedLessons,
      hours: learningHours,
      certificates: completedCourses,
      newEnrollments: newEnrollments.length,
      lastWeekCompleted
    };
  };
  
  const isLoading = coursesLoading || progressLoading || recentLoading;
  const stats = calculateStats();

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Enrolled Courses" 
          value={stats.enrolled.toString()} 
          change={stats.newEnrollments > 0 ? `+${stats.newEnrollments} new` : undefined} 
          icon={<Book className="h-6 w-6 text-primary-600" />} 
          bgColor="bg-primary-50"
          isLoading={isLoading}
        />
        
        <StatsCard 
          title="Completed Lessons" 
          value={stats.completed.toString()} 
          change={stats.lastWeekCompleted > 0 ? `+${stats.lastWeekCompleted} this week` : undefined}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />} 
          bgColor="bg-green-50"
          isLoading={isLoading}
        />
        
        <StatsCard 
          title="Learning Hours" 
          value={stats.hours.toString()} 
          subtext="hours" 
          icon={<Clock className="h-6 w-6 text-blue-600" />} 
          bgColor="bg-blue-50"
          isLoading={isLoading}
        />
        
        <StatsCard 
          title="Certificates" 
          value={stats.certificates.toString()} 
          subtext="earned" 
          icon={<Award className="h-6 w-6 text-yellow-600" />} 
          bgColor="bg-yellow-50"
          isLoading={isLoading}
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
          courses={courses?.filter((c: any) => 
            !progress?.some(p => p.courseId === c.id)
          ).slice(0, 4)}
          showEnrollButton={true}
        />
      </div>
    </div>
  );
};

export default Dashboard;

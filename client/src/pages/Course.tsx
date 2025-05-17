import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { calculateCourseProgress } from "@/lib/courses";
import { EnrollButton } from "@/components/EnrollButton";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, BarChart, Users } from "lucide-react";

export default function Course() {
  const { courseId } = useParams();
  const { user } = useAuth();
  
  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
  });
  
  // Fetch lessons for the course
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}/lessons`],
  });
  
  // Fetch enrollment status if user is logged in
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: [`/api/enrollments/${courseId}`],
    enabled: !!user,
  });
  
  // Fetch user progress for this course if enrolled
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: [`/api/progress/${courseId}`],
    enabled: !!enrollment,
  });
  
  const isLoading = courseLoading || lessonsLoading || enrollmentLoading || progressLoading;
  
  // Calculate course progress percentage
  const progressPercentage = progress && lessons ? 
    calculateCourseProgress(progress, lessons) : 0;
  
  // Find first incomplete lesson or first lesson if none completed
  const nextLesson = lessons && progress ? 
    lessons.find(lesson => 
      !progress.some(p => p.lessonId === lesson.id && p.completed)
    ) || lessons[0] : null;
  
  function getLevelColor(level: string) {
    switch(level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen">
          <TopNavbar />
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen">
          <TopNavbar />
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
              <p className="mt-2 text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
              <Button className="mt-6" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Helmet>
        <title>{course.title} - Learning Tracker</title>
        <meta name="description" content={course.description} />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <TopNavbar />
        
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="md:flex md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                {course.category && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {course.category}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex-shrink-0 md:w-64">
              {enrollment ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 font-medium">Course Progress</p>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 text-right">{progressPercentage}% complete</p>
                </div>
              ) : (
                <EnrollButton courseId={parseInt(courseId as string)} />
              )}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">About this course</h2>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-md font-medium">{course.lessonCount} lessons</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-primary-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="text-md font-medium">{course.level}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="text-md font-medium">{course.enrollmentCount || 0} enrolled</p>
                  </div>
                </div>
              </div>
              
              {enrollment && nextLesson && (
                <div className="mt-6">
                  <Button 
                    className="w-full md:w-auto" 
                    onClick={() => window.location.href = `/lesson/${nextLesson.id}`}
                  >
                    {progress && progress.length > 0 ? 'Continue Learning' : 'Start Learning'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Course Content</h2>
              
              {lessons && lessons.length > 0 ? (
                <div className="space-y-4">
                  {lessons.map((lesson: any) => {
                    const lessonProgress = progress?.find((p: any) => p.lessonId === lesson.id);
                    const isCompleted = lessonProgress?.completed;
                    
                    return (
                      <div 
                        key={lesson.id} 
                        className={`p-4 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                              {isCompleted ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-xs text-gray-600">{lesson.order}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-gray-900 font-medium">{lesson.title}</h3>
                              {lesson.duration && (
                                <p className="text-xs text-gray-500">{lesson.duration} min</p>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            variant={isCompleted ? "outline" : "default"}
                            size="sm"
                            onClick={() => window.location.href = `/lesson/${lesson.id}`}
                          >
                            {isCompleted ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No lessons available for this course yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
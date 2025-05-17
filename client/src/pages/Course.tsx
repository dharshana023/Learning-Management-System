import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { ArrowLeft, Play, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [_, navigate] = useLocation();
  const userId = 1; // Default user ID

  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
  });

  // Fetch lessons for this course
  const { data: lessons, isLoading: isLoadingLessons } = useQuery({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  // Fetch progress for this course
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/progress/${userId}/course/${courseId}`],
    enabled: !!courseId,
  });

  // Calculate which lessons are completed
  const completedLessons = new Set(
    progress?.filter((p: any) => p.completed).map((p: any) => p.lessonId) || []
  );

  // Calculate course progress percentage
  const progressPercentage = lessons?.length
    ? Math.round((completedLessons.size / lessons.length) * 100)
    : 0;

  // Start the first lesson that's not completed, or the first lesson if none are completed
  const handleStartCourse = () => {
    if (!lessons?.length) return;
    
    // Find first incomplete lesson, or just take the first lesson
    const firstIncomplete = lessons.find((lesson: any) => !completedLessons.has(lesson.id));
    const lessonToStart = firstIncomplete || lessons[0];
    
    navigate(`/lesson/${lessonToStart.id}`);
  };

  const isLoading = isLoadingCourse || isLoadingLessons || isLoadingProgress;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen">
          <TopNavbar />
          <div className="py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading course details...</p>
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
          <div className="py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <p className="text-red-500">Course not found</p>
                <Link href="/">
                  <a className="mt-4 inline-block text-primary-600 hover:text-primary-700">
                    Back to Dashboard
                  </a>
                </Link>
              </div>
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
        <meta name="description" content={`Learn ${course.title}. ${course.description}`} />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <TopNavbar />
        
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link href="/">
                <a className="inline-flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Dashboard
                </a>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48 md:h-64">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{course.title}</h1>
                  <p className="text-white text-opacity-90 mt-2">{course.description}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-sm bg-gray-100 text-gray-800 font-medium rounded-full px-3 py-1 mr-2">
                      {course.category}
                    </span>
                    <span className="text-sm bg-gray-100 text-gray-800 font-medium rounded-full px-3 py-1">
                      {course.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">
                      {completedLessons.size}/{lessons?.length || 0} lessons completed
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${progressPercentage === 100 ? "bg-green-500" : "bg-primary-500"}`} 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleStartCourse}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-8"
                >
                  {progressPercentage > 0 && progressPercentage < 100 
                    ? "Continue Course" 
                    : progressPercentage === 100 
                      ? "Review Course" 
                      : "Start Course"}
                </button>
                
                <h2 className="text-xl font-bold mb-4">Course Content</h2>
                <div className="space-y-4">
                  {lessons?.map((lesson: any) => (
                    <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                      <a className="block">
                        <div className="flex items-start p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                          <div className="flex-shrink-0 mr-4">
                            {completedLessons.has(lesson.id) ? (
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <Play className="h-5 w-5 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">
                              {completedLessons.has(lesson.id) ? "Completed" : "Not completed"}
                            </p>
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Course;

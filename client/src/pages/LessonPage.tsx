import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import Lesson from "@/components/Lesson";
import { Helmet } from "react-helmet";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { lessonVideos } from "@/lib/courses";

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const numericLessonId = parseInt(lessonId || "1");
  
  // Fetch lesson information
  const { data: lesson } = useQuery({ 
    queryKey: [`/api/lessons/${numericLessonId}`] 
  });
  
  // Fetch course details if we have the lesson
  const { data: course } = useQuery({
    queryKey: [`/api/courses/${lesson?.courseId}`],
    enabled: !!lesson?.courseId,
  });
  
  // Fallback to video data if API doesn't return yet
  const fallbackLesson = lessonVideos[lessonId || "1"] || lessonVideos["1"];
  const lessonTitle = lesson?.title || fallbackLesson.title;
  const courseTitle = course?.title || "Course";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Helmet>
        <title>{lessonTitle} - {courseTitle} | Learning Tracker</title>
        <meta name="description" content={`Watch and learn ${lessonTitle} in our ${courseTitle}.`} />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <TopNavbar />
        
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Lesson />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonPage;

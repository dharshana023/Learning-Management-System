import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { lessonVideos, getAdjacentLessons } from "@/lib/courses";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const Lesson = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const numericLessonId = parseInt(lessonId || "1");
  const userId = 1; // Default user ID

  // Fetch lesson details
  const { data: lesson } = useQuery({ 
    queryKey: [`/api/lessons/${numericLessonId}`] 
  });

  // Fetch course details
  const { data: course } = useQuery({
    queryKey: [`/api/courses/${lesson?.courseId}`],
    enabled: !!lesson?.courseId,
  });

  // Fetch all lessons for this course
  const { data: courseLessons } = useQuery({
    queryKey: [`/api/courses/${lesson?.courseId}/lessons`],
    enabled: !!lesson?.courseId,
  });

  // Fetch progress for this course
  const { data: courseProgress } = useQuery({
    queryKey: [`/api/progress/${userId}/course/${lesson?.courseId}`],
    enabled: !!lesson?.courseId,
  });

  // Get progress for current lesson
  const { data: lessonProgress } = useQuery({
    queryKey: [`/api/progress/${userId}/lesson/${numericLessonId}`],
    enabled: !!numericLessonId,
  });

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (lessonProgress) {
      setIsCompleted(lessonProgress.completed);
    }
  }, [lessonProgress]);

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { completed: boolean }) => {
      if (!lesson) return null;
      
      return apiRequest("POST", "/api/progress", {
        userId,
        courseId: lesson.courseId,
        lessonId: numericLessonId,
        completed: data.completed,
        progress: data.completed ? 100 : 75,
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}/course/${lesson?.courseId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}/lesson/${numericLessonId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}/recent`] });
    },
  });

  const handleMarkComplete = () => {
    const newCompletionStatus = !isCompleted;
    setIsCompleted(newCompletionStatus);
    updateProgressMutation.mutate({ completed: newCompletionStatus });
  };

  // Calculate adjacent lessons
  const adjacentLessons = lesson 
    ? getAdjacentLessons(lesson.courseId, numericLessonId) 
    : { prev: null, next: null };

  // Calculate course progress
  const completedLessonsCount = courseProgress?.filter((p: any) => p.completed).length || 0;
  const totalLessonsCount = courseLessons?.length || 0;
  const progressPercentage = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  // Fallback to lessonVideos if API data not available
  const fallbackLesson = lessonVideos[lessonId || "1"] || lessonVideos["1"];

  if (!lesson && !fallbackLesson) {
    return <div className="p-4 text-center">Loading lesson...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Link href={course ? `/course/${course.id}` : "/"}>
            <a className="mr-3 p-1 rounded-full hover:bg-gray-200">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </a>
          </Link>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{course?.title || "Course"}</h2>
            <p className="text-sm text-gray-600">Lesson: {lesson?.title || fallbackLesson.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {adjacentLessons.prev && (
            <Link href={`/lesson/${adjacentLessons.prev}`}>
              <a className="p-1 rounded-full hover:bg-gray-200" title="Previous Lesson">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            </Link>
          )}
          
          {adjacentLessons.next && (
            <Link href={`/lesson/${adjacentLessons.next}`}>
              <a className="p-1 rounded-full hover:bg-gray-200" title="Next Lesson">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </Link>
          )}
          
          <button 
            className={`p-1 rounded-full hover:bg-gray-200 ${isCompleted ? "text-green-600" : "text-gray-600"}`}
            title={isCompleted ? "Marked as Complete" : "Mark as Complete"}
            onClick={handleMarkComplete}
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="aspect-video w-full">
        <iframe
          src={lesson?.videoUrl || fallbackLesson.url}
          title={lesson?.title || fallbackLesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">About this lesson</h3>
          <p className="text-gray-700">
            {lesson?.title || fallbackLesson.title} is part of the {course?.title || "course"} curriculum. 
            This lesson covers important concepts related to the topic.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Course Progress</h3>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4 flex-1">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {completedLessonsCount}/{totalLessonsCount} complete
            </span>
          </div>
        </div>

        {courseLessons && courseLessons.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Course Content</h3>
            <ul className="space-y-3">
              {courseLessons.map((courseLesson: any) => {
                const lessonProgressItem = courseProgress?.find(
                  (p: any) => p.lessonId === courseLesson.id
                );
                const isLessonCompleted = lessonProgressItem?.completed || false;
                const isCurrentLesson = courseLesson.id === numericLessonId;

                return (
                  <li 
                    key={courseLesson.id} 
                    className={`flex items-center p-3 rounded-lg ${
                      isCurrentLesson 
                        ? "bg-white border-2 border-primary-500" 
                        : isLessonCompleted 
                          ? "bg-gray-50" 
                          : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                      isLessonCompleted ? "bg-green-100" : "bg-primary-100"
                    }`}>
                      {isLessonCompleted ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{courseLesson.title}</h4>
                      <p className="text-xs text-gray-500">
                        {isLessonCompleted 
                          ? "Completed" 
                          : isCurrentLesson 
                            ? "In progress" 
                            : "Not started"}
                      </p>
                    </div>
                    <Link href={`/lesson/${courseLesson.id}`}>
                      <a className="text-primary-600 hover:text-primary-700 text-sm">
                        {isCurrentLesson ? "Current" : isLessonCompleted ? "Rewatch" : "Start"}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lesson;

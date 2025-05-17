import { Link } from "wouter";
import { calculateCourseProgress } from "@/lib/courses";
import { EnrollButton } from "./EnrollButton";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    level: string;
    lessonCount: number;
    isEnrolled?: boolean;
  };
  progress?: { lessonId: number; completed: boolean }[];
  showEnrollButton?: boolean;
}

const CourseCard = ({ course, progress, showEnrollButton = false }: CourseCardProps) => {
  // Calculate course progress
  const progressPercent = progress 
    ? calculateCourseProgress(progress, course.id)
    : 0;
  
  // Get completed lesson count
  const completedLessons = progress
    ? progress.filter(p => p.completed).length
    : 0;
    
  // Determine status text
  let statusText = "Not started";
  let actionText = "Start Course";
  let lastAccessText = "";
  
  if (progressPercent > 0 && progressPercent < 100) {
    statusText = `${completedLessons} of ${course.lessonCount} lessons completed`;
    actionText = "Resume Course";
    lastAccessText = "Last: 2 days ago";
  } else if (progressPercent === 100) {
    statusText = `${completedLessons} of ${course.lessonCount} lessons completed`;
    actionText = "Review Course";
    lastAccessText = "Completed";
  }

  const isEnrolled = course.isEnrolled || progressPercent > 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-200 rounded-t-lg relative overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={`${course.title} Course`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h3 className="font-bold">{course.title}</h3>
            <p className="text-sm">{statusText}</p>
          </div>
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge variant={getLevelVariant(course.level)}>
            {course.level}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span 
            className={`text-sm font-medium ${
              progressPercent === 100 
                ? "text-green-600" 
                : progressPercent > 0 
                  ? "text-primary-600" 
                  : "text-gray-600"
            }`}
          >
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              progressPercent === 100 
                ? "bg-green-500" 
                : progressPercent > 0 
                  ? "bg-primary-500" 
                  : "bg-gray-500"
            }`} 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
          {course.description}
        </div>
        
        <div className="mt-4">
          {showEnrollButton ? (
            <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
          ) : (
            <div className="flex justify-between items-center">
              <Link href={progressPercent > 0 ? `/course/${course.id}/resume` : `/course/${course.id}`}>
                <a className="text-primary-600 hover:text-primary-700 text-sm font-medium">{actionText}</a>
              </Link>
              <span className="text-gray-500 text-sm">{lastAccessText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine the badge variant based on level
function getLevelVariant(level: string) {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'default';
    case 'intermediate':
      return 'secondary';
    case 'advanced':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default CourseCard;

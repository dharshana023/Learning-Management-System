import { Link } from "wouter";
import { Play } from "lucide-react";

interface RecentlyViewedProps {
  recentLessons?: {
    id: number;
    courseId: number;
    title: string;
    courseTitle: string;
    lastViewed: string;
    progress: number;
  }[];
}

const RecentlyViewed = ({ recentLessons = [] }: RecentlyViewedProps) => {
  // Function to format date
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (!recentLessons || recentLessons.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No recently viewed lessons</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {recentLessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center p-4 hover:bg-gray-50">
            <div className="flex-shrink-0 h-12 w-12 rounded bg-primary-100 flex items-center justify-center text-primary-600">
              <Play className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-500">{lesson.courseTitle}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTimeAgo(lesson.lastViewed)}
                </span>
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary-500 h-1.5 rounded-full" 
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <Link href={`/lesson/${lesson.id}`}>
              <a className="ml-4 text-primary-600 hover:text-primary-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentlyViewed;

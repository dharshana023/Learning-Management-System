import CourseCard from "./CourseCard";

interface CourseProgressProps {
  courses?: { id: number; title: string; description: string; imageUrl: string; level: string; lessonCount: number }[];
  progress?: any[];
}

const CourseProgress = ({ courses = [], progress = [] }: CourseProgressProps) => {
  // Filter to only show courses that have progress
  const courseIds = progress ? new Set(progress.map((p) => p.courseId)) : new Set();
  const coursesWithProgress = courses?.filter((course) => courseIds.has(course.id));

  if (!courses?.length || !progress?.length) {
    return (
      <div className="bg-white rounded-lg p-6 text-center shadow">
        <p className="text-gray-500">No courses in progress. Start learning today!</p>
      </div>
    );
  }

  // Group progress by course
  const progressByCourse: Record<number, any[]> = {};
  progress.forEach((p) => {
    if (!progressByCourse[p.courseId]) {
      progressByCourse[p.courseId] = [];
    }
    progressByCourse[p.courseId].push(p);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {coursesWithProgress?.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progress={progressByCourse[course.id]}
        />
      ))}
    </div>
  );
};

export default CourseProgress;

import CourseCard from "./CourseCard";

interface CourseListProps {
  courses?: { id: number; title: string; description: string; imageUrl: string; level: string; lessonCount: number }[];
  showEnrollButton?: boolean;
}

const CourseList = ({ courses = [], showEnrollButton = false }: CourseListProps) => {
  if (!courses?.length) {
    return (
      <div className="bg-white rounded-lg p-6 text-center shadow">
        <p className="text-gray-500">No courses available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          showEnrollButton={showEnrollButton}
        />
      ))}
    </div>
  );
};

export default CourseList;

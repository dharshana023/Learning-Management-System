import { 
  users, type User, type InsertUser,
  courses, type Course, type InsertCourse,
  lessons, type Lesson, type InsertLesson,
  userProgress, type UserProgress, type InsertUserProgress 
} from "@shared/schema";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Lesson methods
  getLessons(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserCourseProgress(userId: number, courseId: number): Promise<UserProgress[]>;
  getUserLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined>;
  createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  markLessonAsCompleted(userId: number, lessonId: number): Promise<UserProgress>;
  getRecentlyViewedLessons(userId: number, limit?: number): Promise<(Lesson & { courseTitle: string, lastViewed: Date | null, progress: number })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private lessons: Map<number, Lesson>;
  private userProgress: Map<number, UserProgress>;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private lessonIdCounter: number;
  private progressIdCounter: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.userProgress = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.lessonIdCounter = 1;
    this.progressIdCounter = 1;
    
    // Initialize with a default user
    this.createUser({ username: "sarah", password: "password123" });
    
    // Initialize courses and lessons
    this.initializeCoursesAndLessons();
  }

  // Initialize courses and lessons with sample data
  private initializeCoursesAndLessons() {
    // Create courses
    const pythonCourse = this.createCourse({
      title: "Python Programming Basics",
      description: "Learn the fundamentals of Python programming",
      imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd",
      category: "Programming",
      level: "Beginner",
      lessonCount: 3
    });
    
    const webCourse = this.createCourse({
      title: "Web Development Fundamentals",
      description: "Master the core technologies of the web",
      imageUrl: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
      category: "Web Development",
      level: "Beginner",
      lessonCount: 3
    });
    
    const dataCourse = this.createCourse({
      title: "Data Science Essentials",
      description: "Introduction to data science concepts and tools",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      category: "Data Science",
      level: "Intermediate",
      lessonCount: 3
    });
    
    const responsiveWebCourse = this.createCourse({
      title: "Responsive Web Design",
      description: "Create websites that work on any device",
      imageUrl: "https://pixabay.com/get/gd384699ba606e524138fbd15e1ea020884226e0f6d8d13de1e0f5b19abc5ec51e2f251f18c5907985c469c806acb43cb5a95f8396a1d54f89043c45dc23f8f7d_1280.jpg",
      category: "Web Development",
      level: "Intermediate",
      lessonCount: 3
    });
    
    const gameCourse = this.createCourse({
      title: "Game Development",
      description: "Learn to build games with Unity and C#",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
      category: "Programming",
      level: "Beginner",
      lessonCount: 3
    });
    
    const cyberCourse = this.createCourse({
      title: "Cybersecurity Fundamentals",
      description: "Learn essential security concepts",
      imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de",
      category: "Technology",
      level: "Intermediate",
      lessonCount: 3
    });
    
    const aiCourse = this.createCourse({
      title: "Intro to AI",
      description: "Fundamentals of artificial intelligence",
      imageUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
      category: "Technology",
      level: "Advanced",
      lessonCount: 3
    });
    
    const speakingCourse = this.createCourse({
      title: "Public Speaking",
      description: "Master the art of public speaking",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
      category: "Personal Development",
      level: "Beginner",
      lessonCount: 3
    });
    
    // Add lessons
    // Python lessons
    this.createLesson({ courseId: pythonCourse.id, title: "Python Intro", videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc", order: 1 });
    this.createLesson({ courseId: pythonCourse.id, title: "Variables & Data Types", videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8", order: 2 });
    this.createLesson({ courseId: pythonCourse.id, title: "Control Flow", videoUrl: "https://www.youtube.com/embed/6iF8Xb7Z3wQ", order: 3 });
    
    // Web Development lessons
    this.createLesson({ courseId: webCourse.id, title: "HTML Basics", videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU", order: 1 });
    this.createLesson({ courseId: webCourse.id, title: "CSS Fundamentals", videoUrl: "https://www.youtube.com/embed/1PnVor36_40", order: 2 });
    this.createLesson({ courseId: webCourse.id, title: "JavaScript Intro", videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c", order: 3 });
    
    // Data Science lessons
    this.createLesson({ courseId: dataCourse.id, title: "What is Data Science?", videoUrl: "https://www.youtube.com/embed/X3paOmcrTjQ", order: 1 });
    this.createLesson({ courseId: dataCourse.id, title: "Python for Data", videoUrl: "https://www.youtube.com/embed/r-uOLxNrNk8", order: 2 });
    this.createLesson({ courseId: dataCourse.id, title: "Pandas Tutorial", videoUrl: "https://www.youtube.com/embed/vmEHCJofslg", order: 3 });
    
    // Responsive Web Design lessons
    this.createLesson({ courseId: responsiveWebCourse.id, title: "Responsive Design Basics", videoUrl: "https://www.youtube.com/embed/srvUrASNj0s", order: 1 });
    this.createLesson({ courseId: responsiveWebCourse.id, title: "Media Queries", videoUrl: "https://www.youtube.com/embed/5xzaGSYd7jM", order: 2 });
    this.createLesson({ courseId: responsiveWebCourse.id, title: "Flexbox Guide", videoUrl: "https://www.youtube.com/embed/fYq5PXgSsbE", order: 3 });
    
    // Game Development lessons
    this.createLesson({ courseId: gameCourse.id, title: "Unity Game Dev", videoUrl: "https://www.youtube.com/embed/IlKaB1etrik", order: 1 });
    this.createLesson({ courseId: gameCourse.id, title: "C# for Unity", videoUrl: "https://www.youtube.com/embed/HXFoUGw7eKk", order: 2 });
    this.createLesson({ courseId: gameCourse.id, title: "Godot 2D Tutorial", videoUrl: "https://www.youtube.com/embed/Z3xSXjWJz_s", order: 3 });
    
    // Cybersecurity lessons
    this.createLesson({ courseId: cyberCourse.id, title: "Intro to Cybersecurity", videoUrl: "https://www.youtube.com/embed/2N3jjGO4vvw", order: 1 });
    this.createLesson({ courseId: cyberCourse.id, title: "Types of Attacks", videoUrl: "https://www.youtube.com/embed/3V2gGkIEqys", order: 2 });
    this.createLesson({ courseId: cyberCourse.id, title: "Password Security", videoUrl: "https://www.youtube.com/embed/3NjQ9b3pgIg", order: 3 });
    
    // AI lessons
    this.createLesson({ courseId: aiCourse.id, title: "AI Basics", videoUrl: "https://www.youtube.com/embed/2ePf9rue1Ao", order: 1 });
    this.createLesson({ courseId: aiCourse.id, title: "Machine Learning Intro", videoUrl: "https://www.youtube.com/embed/GwIo3gDZCVQ", order: 2 });
    this.createLesson({ courseId: aiCourse.id, title: "Neural Networks", videoUrl: "https://www.youtube.com/embed/aircAruvnKk", order: 3 });
    
    // Public Speaking lessons
    this.createLesson({ courseId: speakingCourse.id, title: "Speaking Confidently", videoUrl: "https://www.youtube.com/embed/tShavGuo0_E", order: 1 });
    this.createLesson({ courseId: speakingCourse.id, title: "Body Language Tips", videoUrl: "https://www.youtube.com/embed/CzH7zHBh4gU", order: 2 });
    this.createLesson({ courseId: speakingCourse.id, title: "Handling Stage Fear", videoUrl: "https://www.youtube.com/embed/xTU9J3j0NYU", order: 3 });
    
    // Create some progress for the default user
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 1,
      lessonId: 1,
      completed: true,
      lastViewed: new Date(),
      progress: 100
    });
    
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 1,
      lessonId: 2,
      completed: true,
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      progress: 100
    });
    
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 1,
      lessonId: 3,
      completed: true,
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      progress: 100
    });
    
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 2,
      lessonId: 4,
      completed: true,
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      progress: 100
    });
    
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 2,
      lessonId: 5,
      completed: true,
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      progress: 100
    });
    
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 2,
      lessonId: 6,
      completed: false,
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      progress: 75
    });
    
    this.createOrUpdateUserProgress({
      userId: 1,
      courseId: 3,
      lessonId: 7,
      completed: true,
      lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      progress: 100
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.category === category);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getLessons(courseId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonIdCounter++;
    const newLesson: Lesson = { ...lesson, id };
    this.lessons.set(id, newLesson);
    return newLesson;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getUserCourseProgress(userId: number, courseId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId && progress.courseId === courseId);
  }

  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId && progress.lessonId === lessonId);
  }

  async createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists
    const existingProgress = Array.from(this.userProgress.values()).find(
      p => p.userId === progress.userId && p.lessonId === progress.lessonId
    );
    
    if (existingProgress) {
      const updatedProgress: UserProgress = {
        ...existingProgress,
        ...progress,
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const id = this.progressIdCounter++;
      const newProgress: UserProgress = { ...progress, id };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async markLessonAsCompleted(userId: number, lessonId: number): Promise<UserProgress> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) throw new Error('Lesson not found');
    
    return this.createOrUpdateUserProgress({
      userId,
      lessonId,
      courseId: lesson.courseId,
      completed: true,
      lastViewed: new Date(),
      progress: 100
    });
  }

  async getRecentlyViewedLessons(userId: number, limit = 5): Promise<(Lesson & { courseTitle: string, lastViewed: Date | null, progress: number })[]> {
    const userProgressList = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId && progress.lastViewed)
      .sort((a, b) => {
        const dateA = a.lastViewed ? new Date(a.lastViewed).getTime() : 0;
        const dateB = b.lastViewed ? new Date(b.lastViewed).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
    
    const result = [];
    
    for (const progress of userProgressList) {
      const lesson = await this.getLesson(progress.lessonId);
      const course = await this.getCourse(progress.courseId);
      
      if (lesson && course) {
        result.push({
          ...lesson,
          courseTitle: course.title,
          lastViewed: progress.lastViewed,
          progress: progress.progress
        });
      }
    }
    
    return result;
  }
}

export const storage = new MemStorage();

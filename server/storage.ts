import bcrypt from 'bcryptjs';
import { db } from './db';
import { 
  users, type User, type InsertUser, type SignupUser,
  courses, type Course, type InsertCourse,
  lessons, type Lesson, type InsertLesson,
  userProgress, type UserProgress, type InsertUserProgress,
  enrollments, type Enrollment, type InsertEnrollment,
  certificates, type Certificate, type InsertCertificate,
  quizzes, type Quiz, type InsertQuiz,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  quizAttempts, type QuizAttempt, type InsertQuizAttempt,
  quizAnswers, type QuizAnswer, type InsertQuizAnswer
} from "@shared/schema";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import crypto from 'crypto';

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  validateUserPassword(username: string, password: string): Promise<User | null>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Enrollment methods
  enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment | undefined>;
  
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
  
  // Quiz methods
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByCourse(courseId: number): Promise<Quiz[]>;
  getQuizzesByLesson(lessonId: number): Promise<Quiz[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: number, data: Partial<QuizAttempt>): Promise<QuizAttempt | undefined>;
  getQuizAttempt(id: number): Promise<QuizAttempt | undefined>;
  getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]>;
  submitQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer>;
  getQuizAnswers(attemptId: number): Promise<QuizAnswer[]>;
  
  // Certificate methods
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getUserCertificates(userId: number): Promise<Certificate[]>;
  getCourseCertificate(userId: number, courseId: number): Promise<Certificate | undefined>;
  verifyCertificate(certificateCode: string): Promise<Certificate | undefined>;
  
  // Data initialization
  initializeData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if it exists
    if (insertUser.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(insertUser.password, salt);
      insertUser.password = hashedPassword;
    }
    
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if it's being updated
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      data.password = hashedPassword;
    }
    
    const result = await db
      .update(users)
      .set({...data, updatedAt: new Date()})
      .where(eq(users.id, id))
      .returning();
      
    return result[0];
  }
  
  async validateUserPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }
    
    return user;
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.category, category));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const result = await db.insert(courses).values(course).returning();
    return result[0];
  }
  
  // Enrollment methods
  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment> {
    const result = await db.insert(enrollments).values(enrollment).returning();
    return result[0];
  }
  
  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const result = await db.select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));
    return result[0];
  }
  
  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return db.select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId));
  }
  
  async updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const result = await db
      .update(enrollments)
      .set(data)
      .where(eq(enrollments.id, id))
      .returning();
      
    return result[0];
  }

  // Lesson methods
  async getLessons(courseId: number): Promise<Lesson[]> {
    return db.select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.order));
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    return result[0];
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values(lesson).returning();
    
    // Update the course lesson count
    await db.update(courses)
      .set({ 
        lessonCount: sql`${courses.lessonCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(courses.id, lesson.courseId));
      
    return result[0];
  }

  // Progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getUserCourseProgress(userId: number, courseId: number): Promise<UserProgress[]> {
    return db.select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.courseId, courseId)
      ));
  }

  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    const result = await db.select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.lessonId, lessonId)
      ));
    return result[0];
  }

  async createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists
    const existingProgress = await this.getUserLessonProgress(
      progress.userId, 
      progress.lessonId
    );
    
    if (existingProgress) {
      const result = await db.update(userProgress)
        .set({ 
          ...progress,
          updatedAt: new Date()
        })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userProgress)
        .values(progress)
        .returning();
      return result[0];
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
    // Join userProgress with lessons and courses to get the data we need
    type RecentLesson = {
      id: number;
      courseId: number;
      title: string;
      videoUrl: string;
      order: number;
      courseTitle: string;
      lastViewed: Date | null;
      progress: number;
      // Adding these to match Lesson type, with default values
      createdAt: Date | null;
      updatedAt: Date | null;
      description: string | null;
      duration: number | null;
      content: string | null;
    };

    const result = await db.select({
      id: lessons.id,
      courseId: lessons.courseId,
      title: lessons.title,
      videoUrl: lessons.videoUrl,
      order: lessons.order,
      description: lessons.description,
      content: lessons.content,
      duration: lessons.duration,
      createdAt: lessons.createdAt,
      updatedAt: lessons.updatedAt,
      courseTitle: courses.title,
      lastViewed: userProgress.lastViewed,
      progress: userProgress.progress
    })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(courses, eq(userProgress.courseId, courses.id))
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.lastViewed))
    .limit(limit);
    
    return result as unknown as (Lesson & { courseTitle: string, lastViewed: Date | null, progress: number })[];
  }
  
  // Quiz methods
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(quizzes).values(quiz).returning();
    
    // If it's a course-level quiz, update the quiz count
    if (quiz.lessonId === null) {
      await db.update(courses)
        .set({ 
          quizCount: sql`${courses.quizCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(courses.id, quiz.courseId));
    }
    
    return result[0];
  }
  
  async getQuiz(id: number): Promise<Quiz | undefined> {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result[0];
  }
  
  async getQuizzesByCourse(courseId: number): Promise<Quiz[]> {
    return db.select()
      .from(quizzes)
      .where(eq(quizzes.courseId, courseId));
  }
  
  async getQuizzesByLesson(lessonId: number): Promise<Quiz[]> {
    return db.select()
      .from(quizzes)
      .where(eq(quizzes.lessonId, lessonId));
  }
  
  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const result = await db.insert(quizQuestions).values(question).returning();
    return result[0];
  }
  
  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return db.select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.order));
  }
  
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const result = await db.insert(quizAttempts).values(attempt).returning();
    return result[0];
  }
  
  async updateQuizAttempt(id: number, data: Partial<QuizAttempt>): Promise<QuizAttempt | undefined> {
    const result = await db
      .update(quizAttempts)
      .set(data)
      .where(eq(quizAttempts.id, id))
      .returning();
      
    return result[0];
  }
  
  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    const result = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return result[0];
  }
  
  async getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    return db.select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.quizId, quizId)
      ))
      .orderBy(desc(quizAttempts.startedAt));
  }
  
  async submitQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer> {
    const result = await db.insert(quizAnswers).values(answer).returning();
    return result[0];
  }
  
  async getQuizAnswers(attemptId: number): Promise<QuizAnswer[]> {
    return db.select()
      .from(quizAnswers)
      .where(eq(quizAnswers.attemptId, attemptId));
  }
  
  // Certificate methods
  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    // Generate a unique certificate code if one is not provided
    if (!certificate.certificateCode) {
      certificate.certificateCode = crypto.randomBytes(16).toString('hex');
    }
    
    const result = await db.insert(certificates).values(certificate).returning();
    
    // Update the enrollment record to mark certificate as issued
    await db.update(enrollments)
      .set({ certificateIssued: true })
      .where(and(
        eq(enrollments.userId, certificate.userId),
        eq(enrollments.courseId, certificate.courseId)
      ));
      
    return result[0];
  }
  
  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return db.select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issueDate));
  }
  
  async getCourseCertificate(userId: number, courseId: number): Promise<Certificate | undefined> {
    const result = await db.select()
      .from(certificates)
      .where(and(
        eq(certificates.userId, userId),
        eq(certificates.courseId, courseId)
      ));
    return result[0];
  }
  
  async verifyCertificate(certificateCode: string): Promise<Certificate | undefined> {
    const result = await db.select()
      .from(certificates)
      .where(eq(certificates.certificateCode, certificateCode));
    return result[0];
  }
  
  // Initialization for the database
  async initializeData(): Promise<void> {
    try {
      // Check if there are any existing users
      const existingUsers = await db.select().from(users).limit(1);
      
      if (existingUsers.length === 0) {
        console.log("Initializing database with sample data...");
        
        // Create a default user
        const defaultUser = await this.createUser({
          username: "sarah",
          password: "password123",
          email: "sarah@example.com",
          firstName: "Sarah",
          lastName: "Johnson",
          role: "student"
        });
        
        // Create sample courses
        const pythonCourse = await this.createCourse({
          title: "Python Programming Basics",
          description: "Learn the fundamentals of Python programming",
          imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd",
          category: "Programming",
          level: "Beginner",
          lessonCount: 0,
          published: true
        });
        
        const webCourse = await this.createCourse({
          title: "Web Development Fundamentals",
          description: "Master the core technologies of the web",
          imageUrl: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
          category: "Web Development",
          level: "Beginner",
          lessonCount: 0,
          published: true
        });
        
        const dataCourse = await this.createCourse({
          title: "Data Science Essentials",
          description: "Introduction to data science concepts and tools",
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
          category: "Data Science",
          level: "Intermediate",
          lessonCount: 0,
          published: true
        });
        
        const responsiveWebCourse = await this.createCourse({
          title: "Responsive Web Design",
          description: "Create websites that work on any device",
          imageUrl: "https://pixabay.com/get/gd384699ba606e524138fbd15e1ea020884226e0f6d8d13de1e0f5b19abc5ec51e2f251f18c5907985c469c806acb43cb5a95f8396a1d54f89043c45dc23f8f7d_1280.jpg",
          category: "Web Development",
          level: "Intermediate",
          lessonCount: 0,
          published: true
        });
        
        const gameCourse = await this.createCourse({
          title: "Game Development",
          description: "Learn to build games with Unity and C#",
          imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
          category: "Programming",
          level: "Beginner",
          lessonCount: 0,
          published: true
        });
        
        const cyberCourse = await this.createCourse({
          title: "Cybersecurity Fundamentals",
          description: "Learn essential security concepts",
          imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de",
          category: "Technology",
          level: "Intermediate",
          lessonCount: 0,
          published: true
        });
        
        const aiCourse = await this.createCourse({
          title: "Intro to AI",
          description: "Fundamentals of artificial intelligence",
          imageUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a",
          category: "Technology",
          level: "Advanced",
          lessonCount: 0,
          published: true
        });
        
        const speakingCourse = await this.createCourse({
          title: "Public Speaking",
          description: "Master the art of public speaking",
          imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
          category: "Personal Development",
          level: "Beginner",
          lessonCount: 0,
          published: true
        });
        
        // Add lessons to courses
        // Python lessons
        const pythonLesson1 = await this.createLesson({ 
          courseId: pythonCourse.id, 
          title: "Python Intro", 
          videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc", 
          order: 1,
          description: "Introduction to Python programming language"
        });
        
        const pythonLesson2 = await this.createLesson({ 
          courseId: pythonCourse.id, 
          title: "Variables & Data Types", 
          videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8", 
          order: 2,
          description: "Learn about variables and data types in Python"
        });
        
        const pythonLesson3 = await this.createLesson({ 
          courseId: pythonCourse.id, 
          title: "Control Flow", 
          videoUrl: "https://www.youtube.com/embed/6iF8Xb7Z3wQ", 
          order: 3,
          description: "Control flow statements in Python: if, for, while"
        });
        
        // Web Development lessons
        const webLesson1 = await this.createLesson({ 
          courseId: webCourse.id, 
          title: "HTML Basics", 
          videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU", 
          order: 1,
          description: "Learn the basics of HTML"
        });
        
        const webLesson2 = await this.createLesson({ 
          courseId: webCourse.id, 
          title: "CSS Fundamentals", 
          videoUrl: "https://www.youtube.com/embed/1PnVor36_40", 
          order: 2,
          description: "Learn the fundamentals of CSS styling"
        });
        
        const webLesson3 = await this.createLesson({ 
          courseId: webCourse.id, 
          title: "JavaScript Intro", 
          videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c", 
          order: 3,
          description: "Introduction to JavaScript programming"
        });
        
        // Data Science lessons
        const dsLesson1 = await this.createLesson({ 
          courseId: dataCourse.id, 
          title: "What is Data Science?", 
          videoUrl: "https://www.youtube.com/embed/X3paOmcrTjQ", 
          order: 1,
          description: "Introduction to data science concepts"
        });
        
        const dsLesson2 = await this.createLesson({ 
          courseId: dataCourse.id, 
          title: "Python for Data", 
          videoUrl: "https://www.youtube.com/embed/r-uOLxNrNk8", 
          order: 2,
          description: "Using Python for data analysis"
        });
        
        const dsLesson3 = await this.createLesson({ 
          courseId: dataCourse.id, 
          title: "Pandas Tutorial", 
          videoUrl: "https://www.youtube.com/embed/vmEHCJofslg", 
          order: 3,
          description: "Introduction to Pandas library for data manipulation"
        });
        
        // Responsive Web Design lessons
        await this.createLesson({ 
          courseId: responsiveWebCourse.id, 
          title: "Responsive Design Basics", 
          videoUrl: "https://www.youtube.com/embed/srvUrASNj0s", 
          order: 1,
          description: "Learn the basics of responsive web design"
        });
        
        await this.createLesson({ 
          courseId: responsiveWebCourse.id, 
          title: "Media Queries", 
          videoUrl: "https://www.youtube.com/embed/5xzaGSYd7jM", 
          order: 2,
          description: "Using media queries for responsive layouts"
        });
        
        await this.createLesson({ 
          courseId: responsiveWebCourse.id, 
          title: "Flexbox Guide", 
          videoUrl: "https://www.youtube.com/embed/fYq5PXgSsbE", 
          order: 3,
          description: "Guide to using CSS Flexbox"
        });
        
        // Game Development lessons
        await this.createLesson({ 
          courseId: gameCourse.id, 
          title: "Unity Game Dev", 
          videoUrl: "https://www.youtube.com/embed/IlKaB1etrik", 
          order: 1,
          description: "Introduction to Unity game development"
        });
        
        await this.createLesson({ 
          courseId: gameCourse.id, 
          title: "C# for Unity", 
          videoUrl: "https://www.youtube.com/embed/HXFoUGw7eKk", 
          order: 2,
          description: "Learning C# for Unity game development"
        });
        
        await this.createLesson({ 
          courseId: gameCourse.id, 
          title: "Godot 2D Tutorial", 
          videoUrl: "https://www.youtube.com/embed/Z3xSXjWJz_s", 
          order: 3,
          description: "Tutorial for 2D game development with Godot"
        });
        
        // Cybersecurity lessons
        await this.createLesson({ 
          courseId: cyberCourse.id, 
          title: "Intro to Cybersecurity", 
          videoUrl: "https://www.youtube.com/embed/2N3jjGO4vvw", 
          order: 1,
          description: "Introduction to cybersecurity concepts"
        });
        
        await this.createLesson({ 
          courseId: cyberCourse.id, 
          title: "Types of Attacks", 
          videoUrl: "https://www.youtube.com/embed/3V2gGkIEqys", 
          order: 2,
          description: "Different types of cyber attacks"
        });
        
        await this.createLesson({ 
          courseId: cyberCourse.id, 
          title: "Password Security", 
          videoUrl: "https://www.youtube.com/embed/3NjQ9b3pgIg", 
          order: 3,
          description: "Best practices for password security"
        });
        
        // AI lessons
        await this.createLesson({ 
          courseId: aiCourse.id, 
          title: "AI Basics", 
          videoUrl: "https://www.youtube.com/embed/2ePf9rue1Ao", 
          order: 1,
          description: "Introduction to artificial intelligence"
        });
        
        await this.createLesson({ 
          courseId: aiCourse.id, 
          title: "Machine Learning Intro", 
          videoUrl: "https://www.youtube.com/embed/GwIo3gDZCVQ", 
          order: 2,
          description: "Introduction to machine learning concepts"
        });
        
        await this.createLesson({ 
          courseId: aiCourse.id, 
          title: "Neural Networks", 
          videoUrl: "https://www.youtube.com/embed/aircAruvnKk", 
          order: 3,
          description: "Understanding neural networks in AI"
        });
        
        // Public Speaking lessons
        await this.createLesson({ 
          courseId: speakingCourse.id, 
          title: "Speaking Confidently", 
          videoUrl: "https://www.youtube.com/embed/tShavGuo0_E", 
          order: 1,
          description: "Tips to speak confidently in public"
        });
        
        await this.createLesson({ 
          courseId: speakingCourse.id, 
          title: "Body Language Tips", 
          videoUrl: "https://www.youtube.com/embed/CzH7zHBh4gU", 
          order: 2,
          description: "Effective body language for public speaking"
        });
        
        await this.createLesson({ 
          courseId: speakingCourse.id, 
          title: "Handling Stage Fear", 
          videoUrl: "https://www.youtube.com/embed/xTU9J3j0NYU", 
          order: 3,
          description: "Techniques to overcome stage fear"
        });
        
        // Enroll the user in some courses
        await this.enrollUserInCourse({
          userId: defaultUser.id,
          courseId: pythonCourse.id
        });
        
        await this.enrollUserInCourse({
          userId: defaultUser.id,
          courseId: webCourse.id
        });
        
        await this.enrollUserInCourse({
          userId: defaultUser.id,
          courseId: dataCourse.id
        });
        
        // Add progress for the enrolled courses
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: pythonCourse.id,
          lessonId: pythonLesson1.id,
          completed: true,
          lastViewed: new Date(),
          progress: 100
        });
        
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: pythonCourse.id,
          lessonId: pythonLesson2.id,
          completed: true,
          lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24),
          progress: 100
        });
        
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: pythonCourse.id,
          lessonId: pythonLesson3.id,
          completed: true,
          lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          progress: 100
        });
        
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: webCourse.id,
          lessonId: webLesson1.id,
          completed: true,
          lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          progress: 100
        });
        
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: webCourse.id,
          lessonId: webLesson2.id,
          completed: true,
          lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
          progress: 100
        });
        
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: webCourse.id,
          lessonId: webLesson3.id,
          completed: false,
          lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24),
          progress: 75
        });
        
        await this.createOrUpdateUserProgress({
          userId: defaultUser.id,
          courseId: dataCourse.id,
          lessonId: dsLesson1.id,
          completed: true,
          lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          progress: 100
        });
        
        // Create a Python quiz
        const pythonQuiz = await this.createQuiz({
          courseId: pythonCourse.id,
          lessonId: null,
          title: "Python Fundamentals Quiz",
          description: "Test your knowledge of Python fundamentals",
          passingScore: 70
        });
        
        // Add questions to the Python quiz
        await this.createQuizQuestion({
          quizId: pythonQuiz.id,
          questionText: "What is the correct way to define a variable in Python?",
          questionType: "multiple-choice",
          options: JSON.stringify(["var x = 5", "x := 5", "x = 5", "let x = 5"]),
          correctAnswer: "x = 5",
          order: 1
        });
        
        await this.createQuizQuestion({
          quizId: pythonQuiz.id,
          questionText: "Which of the following is a valid way to start a comment in Python?",
          questionType: "multiple-choice",
          options: JSON.stringify(["// Comment", "/* Comment */", "# Comment", "<!-- Comment -->"]),
          correctAnswer: "# Comment",
          order: 2
        });
        
        await this.createQuizQuestion({
          quizId: pythonQuiz.id,
          questionText: "What is the output of print(type(5))?",
          questionType: "multiple-choice",
          options: JSON.stringify(["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'number'>"]),
          correctAnswer: "<class 'int'>",
          order: 3
        });
        
        // Create an HTML quiz
        const htmlQuiz = await this.createQuiz({
          courseId: webCourse.id,
          lessonId: webLesson1.id,
          title: "HTML Basics Quiz",
          description: "Test your knowledge of HTML",
          passingScore: 80
        });
        
        // Add questions to the HTML quiz
        await this.createQuizQuestion({
          quizId: htmlQuiz.id,
          questionText: "Which tag is used to define a hyperlink in HTML?",
          questionType: "multiple-choice",
          options: JSON.stringify(["<link>", "<a>", "<href>", "<url>"]),
          correctAnswer: "<a>",
          order: 1
        });
        
        await this.createQuizQuestion({
          quizId: htmlQuiz.id,
          questionText: "What does HTML stand for?",
          questionType: "multiple-choice",
          options: JSON.stringify([
            "Hypertext Markup Language", 
            "Hyper Transfer Markup Language", 
            "Hypertext Machine Language", 
            "Hyper Tool Multi Language"
          ]),
          correctAnswer: "Hypertext Markup Language",
          order: 2
        });
        
        // Issue a certificate for the Python course
        await this.createCertificate({
          userId: defaultUser.id,
          courseId: pythonCourse.id,
          certificateUrl: "https://example.com/certificates/python-001",
          certificateCode: "PYTHON-SARAH-001"
        });
        
        console.log("Database initialized successfully!");
      } else {
        console.log("Database already contains data, skipping initialization.");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();

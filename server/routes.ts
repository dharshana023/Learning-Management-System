import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { authenticate, optionalAuth, validateLogin, validateSignup, getCurrentUser } from "./auth";
import { 
  insertUserSchema, 
  insertEnrollmentSchema, 
  insertCourseSchema, 
  insertLessonSchema,
  insertQuizSchema,
  insertQuizQuestionSchema,
  insertQuizAttemptSchema,
  insertQuizAnswerSchema
} from "@shared/schema";

// Helper to validate request body
const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: () => void) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid request body", error });
    }
  };
};

// Helper to parse request params
const parseParams = (params: { [key: string]: string }, fields: string[]) => {
  const parsed: { [key: string]: number } = {};
  
  for (const field of fields) {
    if (params[field]) {
      parsed[field] = parseInt(params[field], 10);
    }
  }
  
  return parsed;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the database if needed
  try {
    await storage.initializeData();
    console.log("Database initialization completed.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
  
  // Authentication Routes
  app.post("/api/auth/login", validateLogin);
  app.post("/api/auth/signup", validateSignup);
  app.get("/api/auth/me", authenticate, getCurrentUser);

  // User Routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.put("/api/users/:id", authenticate, async (req, res) => {
    const userId = parseInt(req.params.id);
    const requestUserId = (req as any).userId;
    
    // Only allow users to update their own profile
    if (userId !== requestUserId) {
      return res.status(403).json({ message: "Unauthorized to update this user" });
    }
    
    try {
      // Validate and sanitize the update data
      const updateData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Course Routes
  app.get("/api/courses", optionalAuth, async (req, res) => {
    const userId = (req as any).userId;
    const courses = await storage.getCourses();
    
    // If user is logged in, fetch their enrollments to mark which courses they're enrolled in
    if (userId) {
      const enrollments = await storage.getUserEnrollments(userId);
      const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
      
      const coursesWithEnrollment = courses.map(course => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course.id)
      }));
      
      return res.json(coursesWithEnrollment);
    }
    
    res.json(courses);
  });

  app.get("/api/courses/category/:category", async (req, res) => {
    const { category } = req.params;
    const courses = await storage.getCoursesByCategory(category);
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json(course);
  });
  
  app.post("/api/courses", authenticate, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Lesson Routes
  app.get("/api/courses/:id/lessons", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const lessons = await storage.getLessons(courseId);
    res.json(lessons);
  });

  app.get("/api/lessons/:id", async (req, res) => {
    const lessonId = parseInt(req.params.id);
    const lesson = await storage.getLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.json(lesson);
  });
  
  app.post("/api/courses/:id/lessons", authenticate, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessonData = insertLessonSchema.parse({
        ...req.body,
        courseId
      });
      
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lesson data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Enrollment Routes
  app.post("/api/enrollments", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { courseId } = insertEnrollmentSchema.parse(req.body);
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      // Enroll the user
      const enrollment = await storage.enrollUserInCourse({
        userId,
        courseId
      });
      
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/enrollments", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const enrollments = await storage.getUserEnrollments(userId);
    
    // Get course details for each enrollment
    const promises = enrollments.map(async (enrollment) => {
      const course = await storage.getCourse(enrollment.courseId);
      return {
        ...enrollment,
        course
      };
    });
    
    const enrollmentsWithCourses = await Promise.all(promises);
    res.json(enrollmentsWithCourses);
  });

  // Progress Routes
  app.get("/api/progress", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const progress = await storage.getUserProgress(userId);
    res.json(progress);
  });

  app.get("/api/progress/course/:courseId", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const courseId = parseInt(req.params.courseId);
    const progress = await storage.getUserCourseProgress(userId, courseId);
    res.json(progress);
  });

  app.get("/api/progress/lesson/:lessonId", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const lessonId = parseInt(req.params.lessonId);
    const progress = await storage.getUserLessonProgress(userId, lessonId);
    
    if (!progress) {
      return res.json(null);
    }
    
    res.json(progress);
  });

  // Create or update progress for a lesson
  const progressUpdateSchema = z.object({
    courseId: z.number(),
    lessonId: z.number(),
    completed: z.boolean().optional(),
    progress: z.number().min(0).max(100).optional(),
  });

  app.post("/api/progress", authenticate, validate(progressUpdateSchema), async (req, res) => {
    const userId = (req as any).userId;
    const progress = await storage.createOrUpdateUserProgress({
      ...req.body,
      userId,
      lastViewed: new Date(),
    });
    res.json(progress);
  });

  // Mark a lesson as completed
  app.post("/api/progress/lesson/:lessonId/complete", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const lessonId = parseInt(req.params.lessonId);
    
    try {
      const progress = await storage.markLessonAsCompleted(userId, lessonId);
      res.json(progress);
    } catch (error) {
      res.status(404).json({ message: "Lesson not found" });
    }
  });

  // Get recently viewed lessons
  app.get("/api/progress/recent", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const recentLessons = await storage.getRecentlyViewedLessons(userId, limit);
    res.json(recentLessons);
  });

  // Quiz Routes
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const quizzes = await storage.getQuizzesByCourse(courseId);
    res.json(quizzes);
  });
  
  app.get("/api/lessons/:lessonId/quizzes", async (req, res) => {
    const lessonId = parseInt(req.params.lessonId);
    const quizzes = await storage.getQuizzesByLesson(lessonId);
    res.json(quizzes);
  });
  
  app.get("/api/quizzes/:id", async (req, res) => {
    const quizId = parseInt(req.params.id);
    const quiz = await storage.getQuiz(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    res.json(quiz);
  });
  
  app.get("/api/quizzes/:id/questions", async (req, res) => {
    const quizId = parseInt(req.params.id);
    const questions = await storage.getQuizQuestions(quizId);
    res.json(questions);
  });
  
  app.post("/api/quizzes", authenticate, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/quizzes/:id/questions", authenticate, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const questionData = insertQuizQuestionSchema.parse({
        ...req.body,
        quizId
      });
      
      const question = await storage.createQuizQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/quizzes/:id/attempts", authenticate, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      const attemptData = insertQuizAttemptSchema.parse({
        ...req.body,
        quizId,
        userId,
        score: 0, // Initial score is 0
        startedAt: new Date()
      });
      
      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attempt data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/quiz-attempts/:id/submit", authenticate, async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Verify the attempt belongs to this user
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt || attempt.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Calculate score based on answers
      const { answers } = req.body;
      if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers must be an array" });
      }
      
      let totalPoints = 0;
      let earnedPoints = 0;
      
      // Process each answer
      for (const answer of answers) {
        const { questionId, userAnswer } = answer;
        
        // Validate the answer submission
        try {
          insertQuizAnswerSchema.parse({
            attemptId,
            questionId,
            userAnswer,
            isCorrect: false, // Will be updated after checking
            pointsEarned: 0 // Will be updated after checking
          });
        } catch (error) {
          return res.status(400).json({ message: "Invalid answer format" });
        }
        
        // Get the question to check the answer
        const questions = await storage.getQuizQuestions(attempt.quizId);
        const question = questions.find(q => q.id === questionId);
        
        if (!question) {
          return res.status(400).json({ message: `Question ${questionId} does not exist` });
        }
        
        totalPoints += question.points;
        const isCorrect = userAnswer === question.correctAnswer;
        const pointsEarned = isCorrect ? question.points : 0;
        earnedPoints += pointsEarned;
        
        // Save the answer
        await storage.submitQuizAnswer({
          attemptId,
          questionId,
          userAnswer,
          isCorrect,
          pointsEarned
        });
      }
      
      // Calculate percentage score
      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      
      // Update the attempt with final score
      const completedAttempt = await storage.updateQuizAttempt(attemptId, {
        score,
        completed: true,
        completedAt: new Date(),
        duration: Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000) // Duration in seconds
      });
      
      res.json(completedAttempt);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Server error submitting quiz" });
    }
  });
  
  app.get("/api/quiz-attempts/:id", authenticate, async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt || attempt.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get the answers for this attempt
      const answers = await storage.getQuizAnswers(attemptId);
      
      res.json({
        ...attempt,
        answers
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Certificate Routes
  app.get("/api/certificates", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const certificates = await storage.getUserCertificates(userId);
    res.json(certificates);
  });
  
  app.get("/api/certificates/course/:courseId", authenticate, async (req, res) => {
    const userId = (req as any).userId;
    const courseId = parseInt(req.params.courseId);
    const certificate = await storage.getCourseCertificate(userId, courseId);
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    res.json(certificate);
  });
  
  app.post("/api/certificates/verify", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Certificate code is required" });
      }
      
      const certificate = await storage.verifyCertificate(code);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found or invalid" });
      }
      
      // Get user and course information
      const [user, course] = await Promise.all([
        storage.getUser(certificate.userId),
        storage.getCourse(certificate.courseId)
      ]);
      
      if (!user || !course) {
        return res.status(404).json({ message: "Certificate information is incomplete" });
      }
      
      // Don't return the user's password
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        certificate,
        user: userWithoutPassword,
        course
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/certificates/issue", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
      
      // Check if user is enrolled and has completed the course
      const enrollment = await storage.getEnrollment(userId, courseId);
      if (!enrollment) {
        return res.status(400).json({ message: "You are not enrolled in this course" });
      }
      
      // Check if certificate already exists
      const existingCertificate = await storage.getCourseCertificate(userId, courseId);
      if (existingCertificate) {
        return res.status(400).json({ message: "Certificate already issued for this course" });
      }
      
      // Generate a certificate URL
      const certificateCode = crypto.randomBytes(16).toString('hex');
      const certificateUrl = `/certificates/${certificateCode}`;
      
      // Issue the certificate
      const certificate = await storage.createCertificate({
        userId,
        courseId,
        certificateUrl,
        certificateCode
      });
      
      res.status(201).json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // For compatibility with the existing frontend during transition
  // These routes will be deprecated after frontend is updated
  app.get("/api/progress/:userId", authenticate, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const requestUserId = (req as any).userId;
    
    // Only allow access to own progress
    if (userId !== requestUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const progress = await storage.getUserProgress(userId);
    res.json(progress);
  });

  app.get("/api/progress/:userId/course/:courseId", authenticate, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const requestUserId = (req as any).userId;
    
    // Only allow access to own progress
    if (userId !== requestUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const courseId = parseInt(req.params.courseId);
    const progress = await storage.getUserCourseProgress(userId, courseId);
    res.json(progress);
  });

  app.get("/api/progress/:userId/lesson/:lessonId", authenticate, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const requestUserId = (req as any).userId;
    
    // Only allow access to own progress
    if (userId !== requestUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const lessonId = parseInt(req.params.lessonId);
    const progress = await storage.getUserLessonProgress(userId, lessonId);
    
    if (!progress) {
      return res.json(null);
    }
    
    res.json(progress);
  });

  app.get("/api/progress/:userId/recent", authenticate, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const requestUserId = (req as any).userId;
    
    // Only allow access to own progress
    if (userId !== requestUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const recentLessons = await storage.getRecentlyViewedLessons(userId, limit);
    res.json(recentLessons);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}

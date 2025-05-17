import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all courses
  app.get("/api/courses", async (req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  // Get course by ID
  app.get("/api/courses/:id", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = await storage.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.json(course);
  });

  // Get lessons for a course
  app.get("/api/courses/:id/lessons", async (req, res) => {
    const courseId = parseInt(req.params.id);
    const lessons = await storage.getLessons(courseId);
    res.json(lessons);
  });

  // Get lesson by ID
  app.get("/api/lessons/:id", async (req, res) => {
    const lessonId = parseInt(req.params.id);
    const lesson = await storage.getLesson(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.json(lesson);
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const progress = await storage.getUserProgress(userId);
    res.json(progress);
  });

  // Get progress for a specific course
  app.get("/api/progress/:userId/course/:courseId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const courseId = parseInt(req.params.courseId);
    const progress = await storage.getUserCourseProgress(userId, courseId);
    res.json(progress);
  });

  // Get progress for a specific lesson
  app.get("/api/progress/:userId/lesson/:lessonId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const lessonId = parseInt(req.params.lessonId);
    const progress = await storage.getUserLessonProgress(userId, lessonId);
    
    if (!progress) {
      return res.json(null);
    }
    
    res.json(progress);
  });

  // Create or update progress for a lesson
  const progressUpdateSchema = z.object({
    userId: z.number(),
    courseId: z.number(),
    lessonId: z.number(),
    completed: z.boolean().optional(),
    progress: z.number().min(0).max(100).optional(),
  });

  app.post("/api/progress", validate(progressUpdateSchema), async (req, res) => {
    const progress = await storage.createOrUpdateUserProgress({
      ...req.body,
      lastViewed: new Date(),
    });
    res.json(progress);
  });

  // Mark a lesson as completed
  app.post("/api/progress/:userId/lesson/:lessonId/complete", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const lessonId = parseInt(req.params.lessonId);
    
    try {
      const progress = await storage.markLessonAsCompleted(userId, lessonId);
      res.json(progress);
    } catch (error) {
      res.status(404).json({ message: "Lesson not found" });
    }
  });

  // Get recently viewed lessons
  app.get("/api/progress/:userId/recent", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const recentLessons = await storage.getRecentlyViewedLessons(userId, limit);
    res.json(recentLessons);
  });

  const httpServer = createServer(app);

  return httpServer;
}

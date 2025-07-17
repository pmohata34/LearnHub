import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertCourseSchema, insertLessonSchema, insertQuizSchema, insertQuizAttemptSchema, insertEnrollmentSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

// Initialize Stripe - will use environment variables
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
}) : null;

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes (simplified - in production would use proper auth)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const { category } = req.query;
      let courses;
      
      if (category) {
        courses = await storage.getCoursesByCategory(category as string);
      } else {
        courses = await storage.getCourses();
      }
      
      // Get instructor info for each course
      const coursesWithInstructor = await Promise.all(
        courses.map(async (course) => {
          const instructor = await storage.getUser(course.instructorId);
          return {
            ...course,
            instructor: instructor ? { id: instructor.id, username: instructor.username } : null
          };
        })
      );
      
      res.json(coursesWithInstructor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const instructor = await storage.getUser(course.instructorId);
      const lessons = await storage.getLessonsByCourse(courseId);
      const quizzes = await storage.getQuizzesByCourse(courseId);
      
      res.json({
        ...course,
        instructor: instructor ? { id: instructor.id, username: instructor.username } : null,
        lessons,
        quizzes
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const updates = req.body;
      const course = await storage.updateCourse(courseId, updates);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Lesson routes
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const lessonData = insertLessonSchema.parse({ ...req.body, courseId });
      const lesson = await storage.createLesson(lessonData);
      res.json(lesson);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Video upload route
  app.post("/api/upload/video", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }
      
      // In production, this would upload to AWS S3 or similar
      const videoUrl = `/uploads/${req.file.filename}`;
      res.json({ videoUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quiz routes
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quizzes", async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quizzes/:id/attempts", async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const { userId, answers } = req.body;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Calculate score
      const questions = quiz.questions as any[];
      let correctAnswers = 0;
      
      answers.forEach((answer: number, index: number) => {
        if (questions[index] && questions[index].correctAnswer === answer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= quiz.passingScore;
      
      const attempt = await storage.createQuizAttempt({
        quizId,
        userId,
        answers,
        score,
        passed
      });
      
      res.json(attempt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enrollment routes
  app.post("/api/enrollments", async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/enrollments", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const enrollments = await storage.getEnrollmentsByUser(userId);
      
      // Get course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return { ...enrollment, course };
        })
      );
      
      res.json(enrollmentsWithCourses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/enrollments/:id/progress", async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { progress } = req.body;
      
      const enrollment = await storage.updateEnrollment(enrollmentId, { progress });
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      // If course is completed (100% progress), generate certificate
      if (progress === 100) {
        const certificate = await storage.createCertificate({
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          certificateUrl: `/certificates/${enrollment.userId}-${enrollment.courseId}.pdf`
        });
        
        res.json({ enrollment, certificate });
      } else {
        res.json({ enrollment });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Certificate routes
  app.get("/api/users/:userId/certificates", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const certificates = await storage.getCertificatesByUser(userId);
      
      // Get course details for each certificate
      const certificatesWithCourses = await Promise.all(
        certificates.map(async (certificate) => {
          const course = await storage.getCourse(certificate.courseId);
          return { ...certificate, course };
        })
      );
      
      res.json(certificatesWithCourses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." });
      }
      
      const { courseId, userId } = req.body;
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const amount = Math.round(parseFloat(course.price) * 100); // Convert to cents
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          courseId: courseId.toString(),
          userId: userId.toString()
        }
      });
      
      // Create payment record
      await storage.createPayment({
        userId,
        courseId,
        amount: course.price,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending"
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const { courseId, userId } = paymentIntent.metadata;
        
        // Update payment status
        const payments = await storage.getPaymentsByUser(parseInt(userId));
        const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
        
        if (payment) {
          await storage.updatePayment(payment.id, { status: "completed" });
        }
        
        // Enroll user in course
        await storage.createEnrollment({
          userId: parseInt(userId),
          courseId: parseInt(courseId),
          progress: 0
        });
        
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment not completed" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const enrollments = await storage.getEnrollmentsByUser(userId);
      const certificates = await storage.getCertificatesByUser(userId);
      const quizAttempts = await storage.getQuizAttemptsByUser(userId);
      
      const completedCourses = enrollments.filter(e => e.progress === 100);
      const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0);
      const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
      
      // Calculate total hours learned (mock calculation)
      const totalHours = enrollments.length * 8; // Assume 8 hours per enrolled course
      
      res.json({
        enrolledCourses: enrollments.length,
        completionRate: avgProgress,
        certificates: certificates.length,
        hoursLearned: totalHours,
        completedCourses: completedCourses.length,
        passedQuizzes: quizAttempts.filter(a => a.passed).length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}

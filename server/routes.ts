import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import paymentRoutes from "./paymentRoutes";
import { storage } from "./storage";
import {
  insertCourseSchema,
  insertLessonSchema,
  insertQuizSchema,
  insertEnrollmentSchema,
  insertUserSchema,
} from "@shared/schema";


const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, "uploads/"),
    filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploads
  app.use("/uploads", express.static("uploads"));

  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) return res.status(400).json({ message: "User already exists" });
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await storage.createUser({ ...userData, password: hashedPassword });
      const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ user: { ...newUser, password: undefined }, token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course Routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = req.query.category
        ? await storage.getCoursesByCategory(req.query.category as string)
        : await storage.getCourses();
      const enriched = await Promise.all(
        courses.map(async (c) => ({
          ...c,
          instructor: await storage.getUser(c.instructorId).then((i) => i && { id: i.id, username: i.username }),
        }))
      );
      res.json(enriched);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      const [instructor, lessons, quizzes] = await Promise.all([
        storage.getUser(course.instructorId),
        storage.getLessonsByCourse(courseId),
        storage.getQuizzesByCourse(courseId),
      ]);
      res.json({
        ...course,
        instructor: instructor ? { id: instructor.id, username: instructor.username } : null,
        lessons,
        quizzes,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const data = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(data);
      res.json(course);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.updateCourse(courseId, req.body);
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json(course);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByCourse(parseInt(req.params.courseId));
      res.json(lessons);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse({ ...req.body, courseId: parseInt(req.params.courseId) });
      const lesson = await storage.createLesson(lessonData);
      res.json(lesson);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/upload/video", upload.single("video"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No video uploaded" });
    res.json({ videoUrl: `/uploads/${req.file.filename}` });
  });

  // Quizzes
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(parseInt(req.params.id));
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });
      res.json(quiz);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/quizzes", async (req, res) => {
    try {
      const quiz = await storage.createQuiz(insertQuizSchema.parse(req.body));
      res.json(quiz);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/quizzes/:id/attempts", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(parseInt(req.params.id));
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });
      const { userId, answers } = req.body;
      const questions = Array.isArray(quiz.questions) ? (quiz.questions as any[]) : [];
      const correct = questions.filter((q: any, i: number) => q.correctAnswer === answers[i]);
      const score = Math.round((correct.length / questions.length) * 100);
      const passed = score >= quiz.passingScore;
      const attempt = await storage.createQuizAttempt({ quizId: quiz.id, userId, answers, score, passed });
      res.json(attempt);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Enrollments
  app.post("/api/enrollments", async (req, res) => {
    try {
      const enrollment = await storage.createEnrollment(insertEnrollmentSchema.parse(req.body));
      res.json(enrollment);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/users/:userId/enrollments", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByUser(parseInt(req.params.userId));
      const enriched = await Promise.all(enrollments.map(async (e) => ({ ...e, course: await storage.getCourse(e.courseId) })));
      res.json(enriched);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/enrollments/:id/progress", async (req, res) => {
    try {
      const { progress } = req.body;
      const enrollment = await storage.updateEnrollment(parseInt(req.params.id), { progress });
      if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
      let certificate = null;
      if (progress === 100) {
        certificate = await storage.createCertificate({
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          certificateUrl: `/certificates/${enrollment.userId}-${enrollment.courseId}.pdf`,
        });
      }
      res.json({ enrollment, certificate });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Certificates
  app.get("/api/users/:userId/certificates", async (req, res) => {
    try {
      const certificates = await storage.getCertificatesByUser(parseInt(req.params.userId));
      const enriched = await Promise.all(certificates.map(async (c) => ({ ...c, course: await storage.getCourse(c.courseId) })));
      res.json(enriched);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Payments
  app.post("/api/create-order", async (req, res) => {
    try {
      const { courseId, userId } = req.body;
      const course = await storage.getCourse(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });
      const amount = Math.round(parseFloat(course.price) * 100);
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { courseId: String(courseId), userId: String(userId) },
      });
      await storage.createPayment({ userId, courseId, amount: course.price, razorpayOrderId: order.id, status: "pending" });
      res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }

      const payment = await storage.getPaymentByOrderId(razorpay_order_id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      await storage.updatePayment(payment.id, { status: "completed", razorpayPaymentId: razorpay_payment_id });
      await storage.createEnrollment({ userId: payment.userId, courseId: payment.courseId, progress: 0 });

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Payment routes
  app.use("/api", paymentRoutes);

  // Stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const [enrollments, certificates, quizAttempts] = await Promise.all([
        storage.getEnrollmentsByUser(userId),
        storage.getCertificatesByUser(userId),
        storage.getQuizAttemptsByUser(userId),
      ]);
      const completed = enrollments.filter((e) => e.progress === 100);
      const avgProgress = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0;
      res.json({
        enrolledCourses: enrollments.length,
        completionRate: avgProgress,
        certificates: certificates.length,
        hoursLearned: enrollments.length * 8,
        completedCourses: completed.length,
        passedQuizzes: quizAttempts.filter((a) => a.passed).length,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return createServer(app);
}

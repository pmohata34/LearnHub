import { ObjectId } from "mongodb";
import { getDb } from "./db"; // You should have a helper that returns connected db instance
import {
  type User, type InsertUser,
  type Course, type InsertCourse,
  type Lesson, type InsertLesson,
  type Quiz, type InsertQuiz,
  type QuizAttempt, type InsertQuizAttempt,
  type Enrollment, type InsertEnrollment,
  type Certificate, type InsertCertificate,
  type Payment, type InsertPayment
} from "@shared/schema";

export const storage = {
  // ---------------- USERS ----------------
  async getUser(id: number): Promise<User | undefined> {
    const db = await getDb();
    return await db.collection<User>("users").findOne({ id });
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    return await db.collection<User>("users").findOne({ username });
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    return await db.collection<User>("users").findOne({ email });
  },

  async createUser(user: InsertUser): Promise<User> {
    const db = await getDb();
    const result = await db.collection("users").insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const db = await getDb();
    await db.collection("users").updateOne({ id }, { $set: updates });
    return await db.collection("users").findOne({ id });
  },

  // ---------------- COURSES ----------------
  async getCourse(id: number): Promise<Course | undefined> {
    const db = await getDb();
    return await db.collection<Course>("courses").findOne({ id });
  },

  async getCourses(): Promise<Course[]> {
    const db = await getDb();
    return await db.collection<Course>("courses").find().toArray();
  },

  async createCourse(course: InsertCourse): Promise<Course> {
    const db = await getDb();
    const result = await db.collection("courses").insertOne(course);
    return { ...course, _id: result.insertedId };
  },

  // ---------------- PAYMENTS ----------------
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const db = await getDb();
    const result = await db.collection("payments").insertOne(payment);
    return { ...payment, _id: result.insertedId };
  },

  async getPaymentByOrderId(orderId: string): Promise<Payment | undefined> {
    const db = await getDb();
    return await db.collection<Payment>("payments").findOne({ razorpay_order_id: orderId });
  },

  async updatePaymentStatus(orderId: string, updates: Partial<Payment>): Promise<void> {
    const db = await getDb();
    await db.collection("payments").updateOne(
      { razorpay_order_id: orderId },
      { $set: updates }
    );
  },

  // ---------------- ENROLLMENTS ----------------
  async enrollUser(enrollment: InsertEnrollment): Promise<Enrollment> {
    const db = await getDb();
    const result = await db.collection("enrollments").insertOne(enrollment);
    return { ...enrollment, _id: result.insertedId };
  },

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    const db = await getDb();
    return await db.collection<Enrollment>("enrollments").find({ userId }).toArray();
  },

  // ---------------- Additional Collections (if needed) ----------------
  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const db = await getDb();
    const result = await db.collection("lessons").insertOne(lesson);
    return { ...lesson, _id: result.insertedId };
  },

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const db = await getDb();
    const result = await db.collection("quizzes").insertOne(quiz);
    return { ...quiz, _id: result.insertedId };
  },

  async saveQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const db = await getDb();
    const result = await db.collection("quizAttempts").insertOne(attempt);
    return { ...attempt, _id: result.insertedId };
  },

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const db = await getDb();
    const result = await db.collection("certificates").insertOne(certificate);
    return { ...certificate, _id: result.insertedId };
  },
};

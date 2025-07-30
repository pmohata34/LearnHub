import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const port = parseInt(process.env.PORT || "5000", 10);

// ✅ Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Middleware: Cross-Origin Resource Sharing
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5000"],
    credentials: true,
  })
);

// ✅ Middleware: Request logging for API routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) logLine += ` :: ${JSON.stringify(capturedJson)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // ✅ Connect to MongoDB
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
    await mongoose.connect(process.env.MONGO_URI);
    log("Connected to MongoDB");

    // ✅ Load API routes
    await registerRoutes(app);

    // ✅ Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    const server = http.createServer(app);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen(port, "127.0.0.1", () => {
      log(`Server running at http://127.0.0.1:${port}`);
    });

    server.on("error", (err) => {
      log(`Server error: ${err.message}`);
    });
  } catch (err) {
    log(`Startup error: ${(err as Error).message}`);
    process.exit(1);
  }
})();
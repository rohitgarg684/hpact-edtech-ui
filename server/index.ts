import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createProxyMiddleware } from "http-proxy-middleware";

// Backend API target URL - Use 0.0.0.0 for Replit compatibility
const BACKEND_TARGET_URL = process.env.BACKEND_URL || 'http://0.0.0.0:8000';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Proxy API requests to external backend in development
if (process.env.NODE_ENV === 'development') {
  // Add logging middleware before proxy
  app.use('/api/*', (req, res, next) => {
    const originalUrl = req.originalUrl || req.url;
    const rewrittenPath = originalUrl.replace(/^\/api/, '');
    const targetUrl = `${BACKEND_TARGET_URL}${rewrittenPath}`;
    log(`🔄 PROXY REQUEST: ${req.method} ${originalUrl} -> ${targetUrl}`);
    next();
  });

  app.use('/api', createProxyMiddleware({
    target: BACKEND_TARGET_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // Remove /api prefix when forwarding
    },
  }));
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Express error:", err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on the port specified in the environment variable PORT
  // Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = app.get("env") === "development" ? "localhost" : "0.0.0.0";
  
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });
})();

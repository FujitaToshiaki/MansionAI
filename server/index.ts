import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedCondominiums } from "./seedCondominiums";
import { seedRevisionHeaders } from "./seedRevisionHeaders";
import { seedDocuments } from "./seedDocuments";
import { seedRegulationRevisions } from "./seedRegulationRevisions";
import { seedRegulationAnalysisResults } from "./seedRegulationAnalysisResults";
import { seedLongTermData } from "./seedLongTermData";
import { seedConsultationData } from "./seedConsultationData";
import { seedProposalsAndActions } from "./seedProposalsAndActions";
import { seedEvaluationData } from "./seedEvaluationData";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  try { await seedCondominiums(); } catch (e) { console.error("Failed to seed condominiums:", e); }
  try { await seedRevisionHeaders(); } catch (e) { console.error("Failed to seed revision_headers:", e); }
  try { await seedDocuments(); } catch (e) { console.error("Failed to seed documents:", e); }
  try { await seedRegulationRevisions(); } catch (e) { console.error("Failed to seed regulation_revisions:", e); }
  try { await seedRegulationAnalysisResults(); } catch (e) { console.error("Failed to seed regulation_analysis_results:", e); }
  try { await seedLongTermData(); } catch (e) { console.error("Failed to seed long_term_data:", e); }
  try { await seedConsultationData(); } catch (e) { console.error("Failed to seed consultation_data:", e); }
  try { await seedProposalsAndActions(); } catch (e) { console.error("Failed to seed proposals_and_actions:", e); }
  try { await seedEvaluationData(); } catch (e) { console.error("Failed to seed evaluation_data:", e); }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

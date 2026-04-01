import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { CjSyncJob } from "./jobs/cjSync.job";

const PORT = Number(env.PORT) || 5000;

process.on("uncaughtException", (err: Error) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Connect DB
    await connectDB();

    // Start CJ Sync Job
    if (env.NODE_ENV !== "test") {
      CjSyncJob.startInterval();
    }

    const server = app.listen(PORT, () => {
      console.log(`\n✅ E-Commerce API Server Running`);
      console.log(`📍 Mode: ${env.NODE_ENV}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log(`❤️ Health: http://localhost:${PORT}/health`);
    });

    process.on("unhandledRejection", (err: Error) => {
      console.error("❌ Unhandled Rejection:", err.message);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

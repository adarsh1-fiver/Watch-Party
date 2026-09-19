require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const http = require("http");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./utils/db");
const { initSocket } = require("./sockets");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: "https://watch-party-tau.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

initSocket(server, CLIENT_URL);

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `[server] API running on port ${PORT}`
      );

      console.log(
        `[server] Client origin: ${CLIENT_URL}`
      );

      console.log(
        `[socket] WebSocket initialized`
      );
    });
  } catch (error) {
    console.error(
      "[server] Startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
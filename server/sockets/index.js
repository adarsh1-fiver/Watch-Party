const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const registerRoomHandlers = require("./roomSocket");

let ioInstance = null;

function getIO() {
  return ioInstance;
}

function initSocket(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = verifyToken(token);

      const user = await User.findById(decoded.sub);

      if (!user) {
        return next(new Error("User no longer exists"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `[socket] Connected: ${socket.user.username} (${socket.id})`
    );

    registerRoomHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(
        `[socket] Disconnected: ${socket.user.username} (${reason})`
      );
    });
  });

  ioInstance = io;

  return io;
}

module.exports = {
  initSocket,
  getIO,
};
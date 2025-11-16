const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });
  } catch (error) {
    console.error('Socket.io initialization error:', error);
    return null;
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join role-specific room
    socket.on('join-role', (role) => {
      socket.join(`role-${role}`);
      console.log(`User joined role room: ${role}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper functions to emit events
const emitToUser = (userId, event, data) => {
  getIO().to(`user-${userId}`).emit(event, data);
};

const emitToRole = (role, event, data) => {
  getIO().to(`role-${role}`).emit(event, data);
};

const emitToAll = (event, data) => {
  getIO().emit(event, data);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToAll
};


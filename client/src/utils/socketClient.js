import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId, role) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    if (userId) {
      socket.emit('join-user', userId);
    }
    if (role) {
      socket.emit('join-role', role);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const onNotification = (callback) => {
  if (socket) {
    socket.on('notification', callback);
  }
};

export const onAppointmentUpdate = (callback) => {
  if (socket) {
    socket.on('appointment-update', callback);
  }
};

export const onBillUpdate = (callback) => {
  if (socket) {
    socket.on('bill-update', callback);
  }
};


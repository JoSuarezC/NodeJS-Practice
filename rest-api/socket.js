let socket;

module.exports = {
  init: (httpServer) => {
    socket = require('socket.io')(
      httpServer,
      {
        cors: {
          origin: 'http://localhost:3000',
          methods: ['GET', 'POST']
        },
      }
    );
    return socket;
  },
  getSocket: () => {
    if (!socket) {
      throw new Error('Socket not initialized');
    }

    return socket;
  },
};
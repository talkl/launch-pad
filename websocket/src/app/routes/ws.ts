import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (socket) => {
    socket.on('message', (message) => {
      const messageText = message.toString();
      socket.send(`Server received: ${messageText}`);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('close', () => {
      console.log('Client disconnected');
    });
  });
} 
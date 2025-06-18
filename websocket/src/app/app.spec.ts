import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';
import WebSocket from 'ws';

describe('API Tests', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = Fastify();
    await server.register(app);
    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /', () => {
    it('should respond with a message', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.json()).toEqual({ message: 'Hello API' });
    });
  });

  describe('WebSocket /ws', () => {
    it('should establish a WebSocket connection', async () => {
      const ws = await server.injectWS('/ws');
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.terminate();
    });

    it('should echo back messages with "Server received:" prefix', async () => {
      const ws = await server.injectWS('/ws');
      const testMessage = 'Hello WebSocket!';
      
      const responsePromise = new Promise<string>((resolve) => {
        ws.on('message', (data) => {
          resolve(data.toString());
        });
      });

      ws.send(testMessage);
      const response = await responsePromise;
      expect(response).toBe(`Server received: ${testMessage}`);
      ws.terminate();
    });

    it('should handle multiple messages in sequence', async () => {
      const ws = await server.injectWS('/ws');
      const messages = ['First', 'Second', 'Third'];
      const receivedMessages: string[] = [];

      const responsePromise = new Promise<void>((resolve) => {
        ws.on('message', (data) => {
          receivedMessages.push(data.toString());
          if (receivedMessages.length === messages.length) {
            resolve();
          }
        });
      });

      messages.forEach(msg => ws.send(msg));
      await responsePromise;

      messages.forEach((msg, index) => {
        expect(receivedMessages[index]).toBe(`Server received: ${msg}`);
      });
      ws.terminate();
    });

    it('should handle connection closure', async () => {
      const ws = await server.injectWS('/ws');
      const closePromise = new Promise<void>((resolve) => {
        ws.on('close', () => {
          resolve();
        });
      });

      ws.terminate();
      await closePromise;
      expect(ws.readyState).toBe(WebSocket.CLOSED);
    });
  });
});

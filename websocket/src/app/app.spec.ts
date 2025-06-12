import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';
import { AddressInfo } from 'net';
import WebSocket from 'ws';

describe('API Tests', () => {
  let server: FastifyInstance;
  let wsClient: WebSocket;
  let wsUrl: string;

  beforeEach(async () => {
    server = Fastify();
    await server.register(app);
    await server.listen();
    
    const address = server.server.address() as AddressInfo;
    wsUrl = `ws://localhost:${address.port}/ws`;
  });

  afterEach(async () => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      await new Promise<void>((resolve) => {
        wsClient.on('close', resolve);
        wsClient.close();
      });
    }
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
      wsClient = new WebSocket(wsUrl);
      
      await new Promise<void>((resolve) => {
        wsClient.on('open', () => {
          expect(wsClient.readyState).toBe(WebSocket.OPEN);
          resolve();
        });
      });
    });

    it('should echo back messages with "Server received:" prefix', async () => {
      wsClient = new WebSocket(wsUrl);
      const testMessage = 'Hello WebSocket!';

      await new Promise<void>((resolve) => {
        wsClient.on('open', () => {
          wsClient.send(testMessage);
        });

        wsClient.on('message', (data) => {
          expect(data.toString()).toBe(`Server received: ${testMessage}`);
          resolve();
        });
      });
    });

    it('should handle multiple messages in sequence', async () => {
      wsClient = new WebSocket(wsUrl);
      const messages = ['First', 'Second', 'Third'];
      const receivedMessages: string[] = [];

      await new Promise<void>((resolve) => {
        wsClient.on('open', () => {
          messages.forEach(msg => wsClient.send(msg));
        });

        wsClient.on('message', (data) => {
          receivedMessages.push(data.toString());
          if (receivedMessages.length === messages.length) {
            messages.forEach((msg, index) => {
              expect(receivedMessages[index]).toBe(`Server received: ${msg}`);
            });
            resolve();
          }
        });
      });
    });

    it('should handle connection closure', async () => {
      wsClient = new WebSocket(wsUrl);
      
      await new Promise<void>((resolve) => {
        wsClient.on('open', () => {
          wsClient.close();
        });

        wsClient.on('close', () => {
          expect(wsClient.readyState).toBe(WebSocket.CLOSED);
          resolve();
        });
      });
    });
  });
});

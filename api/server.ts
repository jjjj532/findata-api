/**
 * local server entry file, for local development
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initCache } from './services/cache.js';
import { generateQuotes, generateOrderBook } from './services/mockData.js';

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const connectedClients = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.set(socket.id, new Set());

  socket.on('subscribe', async (symbol: string) => {
    const subscriptions = connectedClients.get(socket.id);
    if (subscriptions) {
      subscriptions.add(symbol);
      socket.join(`symbol:${symbol}`);
      
      const orderBook = generateOrderBook(symbol);
      socket.emit('orderbook_update', orderBook);
    }
  });

  socket.on('unsubscribe', (symbol: string) => {
    const subscriptions = connectedClients.get(socket.id);
    if (subscriptions) {
      subscriptions.delete(symbol);
      socket.leave(`symbol:${symbol}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });
});

async function broadcastQuotes() {
  const quotes = generateQuotes();
  io.emit('quotes_update', quotes);
}

async function broadcastOrderBooks() {
  for (const [clientId, symbols] of connectedClients) {
    for (const symbol of symbols) {
      const orderBook = generateOrderBook(symbol);
      io.to(`symbol:${symbol}`).emit('orderbook_update', orderBook);
    }
  }
}

async function startServer() {
  try {
    await initCache();
    console.log('Cache initialized');
  } catch (error) {
    console.log('Redis not available, running without cache');
  }

  httpServer.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
    console.log(`WebSocket available on ws://localhost:${PORT}`);
  });

  setInterval(broadcastQuotes, 2000);
  setInterval(broadcastOrderBooks, 1000);
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
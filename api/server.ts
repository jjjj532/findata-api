/**
 * local server entry file, for local development
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initCache } from './services/cache.js';
import { generateQuotes } from './services/mockData.js';
import { getDepthOrderBook } from './services/orderbook.js';
import { collectAllMarketData } from './sources/fullDataCollector.js';

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const connectedClients = new Map<string, Set<string>>();
const clientSubscriptions = new Map<string, string[]>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.set(socket.id, new Set());
  clientSubscriptions.set(socket.id, []);

  socket.on('subscribe', async (symbol: string) => {
    const subscriptions = connectedClients.get(socket.id);
    const clientSubs = clientSubscriptions.get(socket.id);
    if (subscriptions && clientSubs) {
      subscriptions.add(symbol);
      if (!clientSubs.includes(symbol)) {
        clientSubs.push(symbol);
      }
      socket.join(`symbol:${symbol}`);
      
      try {
        const orderBook = await getDepthOrderBook(symbol, 10);
        if (orderBook) {
          socket.emit('orderbook_update', orderBook);
        }
      } catch (error) {
        console.error(`Error fetching order book for ${symbol}:`, error);
      }
    }
  });

  socket.on('subscribe_batch', async (symbols: string[]) => {
    const subscriptions = connectedClients.get(socket.id);
    const clientSubs = clientSubscriptions.get(socket.id);
    if (subscriptions && clientSubs) {
      for (const symbol of symbols) {
        subscriptions.add(symbol);
        if (!clientSubs.includes(symbol)) {
          clientSubs.push(symbol);
        }
        socket.join(`symbol:${symbol}`);
      }
    }
  });

  socket.on('unsubscribe', (symbol: string) => {
    const subscriptions = connectedClients.get(socket.id);
    const clientSubs = clientSubscriptions.get(socket.id);
    if (subscriptions && clientSubs) {
      subscriptions.delete(symbol);
      const index = clientSubs.indexOf(symbol);
      if (index > -1) {
        clientSubs.splice(index, 1);
      }
      socket.leave(`symbol:${symbol}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
    clientSubscriptions.delete(socket.id);
  });
});

async function broadcastQuotes() {
  try {
    const quotes = generateQuotes();
    io.emit('quotes_update', quotes);
  } catch (error) {
    console.error('Error broadcasting quotes:', error);
  }
}

async function broadcastOrderBooks() {
  const symbolsUpdated = new Set<string>();
  
  for (const [clientId, symbols] of connectedClients) {
    for (const symbol of symbols) {
      if (!symbolsUpdated.has(symbol)) {
        symbolsUpdated.add(symbol);
        try {
          const orderBook = await getDepthOrderBook(symbol, 10);
          if (orderBook) {
            io.to(`symbol:${symbol}`).emit('orderbook_update', orderBook);
          }
        } catch (error) {
          console.error(`Error broadcasting order book for ${symbol}:`, error);
        }
      }
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

  collectAllMarketData();

  httpServer.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
    console.log(`WebSocket available on ws://localhost:${PORT}`);
  });

  setInterval(broadcastQuotes, 5000);
  setInterval(broadcastOrderBooks, 3000);
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
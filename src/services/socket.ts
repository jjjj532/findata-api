import { io, Socket } from 'socket.io-client';
import { Quote, OrderBook } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToQuotes(callback: (quotes: Quote[]) => void): () => void {
  const s = connectSocket();
  s.on('quotes_update', callback);
  
  return () => {
    s.off('quotes_update', callback);
  };
}

export function subscribeToOrderBook(symbol: string, callback: (orderBook: OrderBook) => void): () => void {
  const s = connectSocket();
  s.emit('subscribe', symbol);
  s.on('orderbook_update', callback);
  
  return () => {
    s.emit('unsubscribe', symbol);
    s.off('orderbook_update', callback);
  };
}
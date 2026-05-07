import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Globe, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { Quote, OrderBook, OHLCV } from '../types';
import { getQuotes, getOrderBook, getHistoricalData } from '../services/api';
import { subscribeToQuotes, subscribeToOrderBook } from '../services/socket';
import QuoteCard from '../components/QuoteCard';
import OrderBookComponent from '../components/OrderBook';
import StockChart from '../components/StockChart';

export default function Dashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [historicalData, setHistoricalData] = useState<OHLCV[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      const data = await getQuotes();
      setQuotes(data);
      setIsLoading(false);
    };
    initData();

    const unsubscribeQuotes = subscribeToQuotes((newQuotes) => {
      setQuotes(newQuotes);
    });

    return () => unsubscribeQuotes();
  }, []);

  useEffect(() => {
    const initOrderBook = async () => {
      const book = await getOrderBook(selectedSymbol, 10);
      if (book) {
        setOrderBook(book);
      }
    };
    initOrderBook();

    const initHistory = async () => {
      const history = await getHistoricalData(selectedSymbol, 30);
      if (history) {
        setHistoricalData(history);
      }
    };
    initHistory();

    const unsubscribeOrderBook = subscribeToOrderBook(selectedSymbol, (newOrderBook) => {
      setOrderBook(newOrderBook);
    });

    return () => unsubscribeOrderBook();
  }, [selectedSymbol]);

  const indices = quotes.filter(q => q.assetClass === 'index');
  const stocks = quotes.filter(q => q.assetClass === 'stock').slice(0, 6);
  const futures = quotes.filter(q => q.assetClass === 'future');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-800 rounded-xl" />
              ))}
            </div>
            <div className="h-8 bg-gray-700 rounded w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Market Overview</h2>
          <p className="text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Real-time data updated every 2 seconds
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {indices.slice(0, 4).map((quote) => (
            <div
              key={quote.symbol}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-sm">{quote.market}</span>
              </div>
              <h3 className="text-white font-semibold">{quote.symbol}</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {quote.price.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 ${quote.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {quote.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Popular Stocks</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((quote) => (
                <QuoteCard 
                  key={quote.symbol} 
                  quote={quote} 
                  onClick={() => setSelectedSymbol(quote.symbol)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Futures</h3>
            </div>
            <div className="space-y-2">
              {futures.map((quote) => (
                <div
                  key={quote.symbol}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{quote.symbol}</p>
                    <p className="text-gray-400 text-xs">{quote.market}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">${quote.price.toFixed(2)}</p>
                    <p className={`text-xs ${quote.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <StockChart data={historicalData} symbol={selectedSymbol} />
          {orderBook && <OrderBookComponent orderBook={orderBook} />}
        </div>
      </div>
    </div>
  );
}
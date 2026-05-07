import { OrderBook as OrderBookType, OrderBookLevel } from '../types';

interface OrderBookProps {
  orderBook: OrderBookType;
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatSize(size: number): string {
  if (size >= 1000000) {
    return `${(size / 1000000).toFixed(2)}M`;
  }
  if (size >= 1000) {
    return `${(size / 1000).toFixed(2)}K`;
  }
  return size.toString();
}

export default function OrderBook({ orderBook }: OrderBookProps) {
  const totalBidSize = orderBook.bids.reduce((sum, level) => sum + level.size, 0);
  const totalAskSize = orderBook.asks.reduce((sum, level) => sum + level.size, 0);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Order Book</h3>
        <span className="text-gray-400 text-sm">{orderBook.symbol}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-gray-400 text-xs">BIDS</span>
            <span className="text-emerald-400 text-xs">Total: {formatSize(totalBidSize)}</span>
          </div>
          <div className="space-y-1">
            {orderBook.bids.map((level: OrderBookLevel, index: number) => {
              const percent = (level.size / totalBidSize) * 100;
              return (
                <div key={index} className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded" style={{ width: `${Math.min(percent * 3, 100)}%` }} />
                  <div className="relative flex items-center justify-between px-2 py-1">
                    <span className="text-emerald-400 text-sm font-medium">${formatPrice(level.price)}</span>
                    <span className="text-gray-300 text-sm">{formatSize(level.size)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-red-400 text-xs">Total: {formatSize(totalAskSize)}</span>
            <span className="text-gray-400 text-xs">ASKS</span>
          </div>
          <div className="space-y-1">
            {orderBook.asks.map((level: OrderBookLevel, index: number) => {
              const percent = (level.size / totalAskSize) * 100;
              return (
                <div key={index} className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded" style={{ width: `${Math.min(percent * 3, 100)}%`, right: 0 }} />
                  <div className="relative flex items-center justify-between px-2 py-1">
                    <span className="text-gray-300 text-sm">{formatSize(level.size)}</span>
                    <span className="text-red-400 text-sm font-medium">${formatPrice(level.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
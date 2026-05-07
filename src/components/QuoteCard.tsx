import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Quote } from '../types';

interface QuoteCardProps {
  quote: Quote;
  onClick?: () => void;
}

export default function QuoteCard({ quote, onClick }: QuoteCardProps) {
  const isPositive = quote.change >= 0;

  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{quote.symbol}</h3>
          <p className="text-gray-400 text-xs">{quote.market}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          quote.assetClass === 'stock' ? 'bg-blue-500/20 text-blue-400' :
          quote.assetClass === 'future' ? 'bg-orange-500/20 text-orange-400' :
          'bg-purple-500/20 text-purple-400'
        }`}>
          {quote.assetClass.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2">
        <div>
          <p className="text-gray-500 text-xs">High</p>
          <p className="text-gray-300 text-sm">${quote.high.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Low</p>
          <p className="text-gray-300 text-sm">${quote.low.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
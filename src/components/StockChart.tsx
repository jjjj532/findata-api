import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { OHLCV } from '../types';

interface StockChartProps {
  data: OHLCV[];
  symbol: string;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function StockChart({ data, symbol }: StockChartProps) {
  const [chartData, setChartData] = useState<OHLCV[]>([]);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const maxPrice = Math.max(...chartData.map(d => d.high));
  const minPrice = Math.min(...chartData.map(d => d.low));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Price Chart</h3>
        <span className="text-gray-400 text-sm">{symbol}</span>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatDate}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={[minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
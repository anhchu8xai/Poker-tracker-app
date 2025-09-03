import { useMemo } from "react";

interface Session {
  date: number;
  profit: number;
  type: "tournament" | "cash";
}

interface ChartViewProps {
  sessions: Session[];
}

export function ChartView({ sessions }: ChartViewProps) {
  const chartData = useMemo(() => {
    if (sessions.length === 0) return [];

    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => a.date - b.date);
    
    // Calculate cumulative profit
    let cumulativeProfit = 0;
    return sortedSessions.map((session) => {
      cumulativeProfit += session.profit;
      return {
        date: new Date(session.date).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        }),
        profit: cumulativeProfit,
        sessionProfit: session.profit,
        type: session.type,
      };
    });
  }, [sessions]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data to display</h3>
        <p className="text-gray-600">Add some sessions to see your profit chart!</p>
      </div>
    );
  }

  const maxProfit = Math.max(...chartData.map(d => d.profit));
  const minProfit = Math.min(...chartData.map(d => d.profit));
  const range = maxProfit - minProfit;
  const padding = range * 0.1;

  const getY = (profit: number) => {
    const normalizedProfit = (profit - minProfit + padding) / (range + 2 * padding);
    return 200 - (normalizedProfit * 180); // 200 is chart height, 180 leaves padding
  };

  const getX = (index: number) => {
    return 50 + (index * (500 - 100)) / (chartData.length - 1); // 500 is chart width, 100 is padding
  };

  const pathData = chartData
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point.profit);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Profit Over Time</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Cumulative Profit</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" height="250" viewBox="0 0 600 250" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="20" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Zero line */}
          {minProfit < 0 && maxProfit > 0 && (
            <line
              x1="50"
              y1={getY(0)}
              x2="550"
              y2={getY(0)}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          )}
          
          {/* Profit line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.map((point, index) => (
            <g key={index}>
              <circle
                cx={getX(index)}
                cy={getY(point.profit)}
                r="4"
                fill={point.sessionProfit >= 0 ? "#10b981" : "#ef4444"}
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Tooltip on hover */}
              <circle
                cx={getX(index)}
                cy={getY(point.profit)}
                r="12"
                fill="transparent"
                className="hover:fill-gray-100 hover:fill-opacity-20 cursor-pointer"
              >
                <title>
                  {point.date}: {formatCurrency(point.sessionProfit)} 
                  (Total: {formatCurrency(point.profit)})
                </title>
              </circle>
            </g>
          ))}
          
          {/* Y-axis labels */}
          <text x="40" y={getY(maxProfit)} textAnchor="end" className="text-xs fill-gray-500">
            {formatCurrency(maxProfit)}
          </text>
          {minProfit < 0 && maxProfit > 0 && (
            <text x="40" y={getY(0)} textAnchor="end" className="text-xs fill-gray-500">
              $0
            </text>
          )}
          <text x="40" y={getY(minProfit)} textAnchor="end" className="text-xs fill-gray-500">
            {formatCurrency(minProfit)}
          </text>
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-12 text-xs text-gray-500">
          <span>{chartData[0]?.date}</span>
          {chartData.length > 1 && (
            <span>{chartData[chartData.length - 1]?.date}</span>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Current Total</p>
          <p className={`text-lg font-semibold ${
            chartData[chartData.length - 1]?.profit >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {formatCurrency(chartData[chartData.length - 1]?.profit || 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Best Session</p>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(Math.max(...chartData.map(d => d.sessionProfit)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Worst Session</p>
          <p className="text-lg font-semibold text-red-600">
            {formatCurrency(Math.min(...chartData.map(d => d.sessionProfit)))}
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    totalProfit: number;
    totalSessions: number;
    winRate: number;
    avgProfit: number;
    totalHours: number;
    hourlyRate: number;
    bestSession: number;
    worstSession: number;
  } | null | undefined;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Profit",
      value: formatCurrency(stats.totalProfit),
      color: stats.totalProfit >= 0 ? "text-green-600" : "text-red-600",
      icon: stats.totalProfit >= 0 ? "📈" : "📉",
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions.toString(),
      color: "text-blue-600",
      icon: "🎯",
    },
    {
      title: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      color: stats.winRate >= 50 ? "text-green-600" : "text-orange-600",
      icon: "🏆",
    },
    {
      title: "Avg Profit/Session",
      value: formatCurrency(stats.avgProfit),
      color: stats.avgProfit >= 0 ? "text-green-600" : "text-red-600",
      icon: "💰",
    },
    {
      title: "Total Hours",
      value: `${stats.totalHours.toFixed(1)}h`,
      color: "text-purple-600",
      icon: "⏰",
    },
    {
      title: "Hourly Rate",
      value: formatCurrency(stats.hourlyRate),
      color: stats.hourlyRate >= 0 ? "text-green-600" : "text-red-600",
      icon: "⚡",
    },
    {
      title: "Best Session",
      value: formatCurrency(stats.bestSession),
      color: "text-green-600",
      icon: "🚀",
    },
    {
      title: "Worst Session",
      value: formatCurrency(stats.worstSession),
      color: "text-red-600",
      icon: "💔",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
            <div className="text-2xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SessionForm } from "./SessionForm";
import { SessionList } from "./SessionList";
import { StatsCards } from "./StatsCards";
import { ChartView } from "./ChartView";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "add">("overview");
  const [filterType, setFilterType] = useState<"all" | "tournament" | "cash">("all");
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "year">("all");

  const getDateFilter = () => {
    const now = Date.now();
    switch (dateRange) {
      case "week":
        return { startDate: now - 7 * 24 * 60 * 60 * 1000, endDate: now };
      case "month":
        return { startDate: now - 30 * 24 * 60 * 60 * 1000, endDate: now };
      case "year":
        return { startDate: now - 365 * 24 * 60 * 60 * 1000, endDate: now };
      default:
        return {};
    }
  };

  const sessions = useQuery(api.sessions.getSessions, {
    type: filterType === "all" ? undefined : filterType as "tournament" | "cash",
    ...getDateFilter(),
  });

  const stats = useQuery(api.sessions.getStats, {
    type: filterType === "all" ? undefined : filterType as "tournament" | "cash",
    ...getDateFilter(),
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "sessions", label: "Sessions", icon: "📋" },
    { id: "add", label: "Add Session", icon: "➕" },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab !== "add" && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Games</option>
              <option value="tournament">Tournaments</option>
              <option value="cash">Cash Games</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <StatsCards stats={stats} />
          <ChartView sessions={sessions || []} />
        </div>
      )}

      {activeTab === "sessions" && (
        <SessionList sessions={sessions || []} />
      )}

      {activeTab === "add" && (
        <div className="max-w-2xl mx-auto">
          <SessionForm onSuccess={() => setActiveTab("sessions")} />
        </div>
      )}
    </div>
  );
}

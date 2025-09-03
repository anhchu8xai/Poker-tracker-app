import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface Session {
  _id: Id<"sessions">;
  type: "tournament" | "cash";
  date: number;
  venue: string;
  gameType: string;
  stakes: string;
  profit: number;
  buyIn?: number;
  prize?: number;
  position?: number;
  totalEntrants?: number;
  buyInAmount?: number;
  cashOut?: number;
  duration?: number;
  notes?: string;
}

interface SessionListProps {
  sessions: Session[];
}

export function SessionList({ sessions }: SessionListProps) {
  const deleteSession = useMutation(api.sessions.deleteSession);

  const handleDelete = async (id: Id<"sessions">) => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteSession({ id });
        toast.success("Session deleted successfully");
      } catch (error) {
        toast.error("Failed to delete session");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-4xl mb-4">🃏</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
        <p className="text-gray-600">Start tracking your poker sessions to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stakes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(session.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.type === "tournament" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {session.type === "tournament" ? "🏆 Tournament" : "💰 Cash"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.venue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.gameType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.stakes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.type === "tournament" ? (
                    <div>
                      {session.position && session.totalEntrants && (
                        <div>{session.position}/{session.totalEntrants}</div>
                      )}
                      {session.buyIn && <div>Buy-in: {formatCurrency(session.buyIn)}</div>}
                    </div>
                  ) : (
                    <div>
                      {session.duration && <div>{Math.round(session.duration / 60)}h</div>}
                      {session.buyInAmount && session.cashOut && (
                        <div>{formatCurrency(session.buyInAmount)} → {formatCurrency(session.cashOut)}</div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    session.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatCurrency(session.profit)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDelete(session._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

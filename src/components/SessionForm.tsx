import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface SessionFormProps {
  onSuccess: () => void;
}

export function SessionForm({ onSuccess }: SessionFormProps) {
  const [type, setType] = useState<"tournament" | "cash">("tournament");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    venue: "",
    gameType: "NLH",
    notes: "",
  });

  const [tournamentData, setTournamentData] = useState({
    buyIn: "",
    rebuyCount: "",
    addOnCount: "",
    addOnAmount: "",
    position: "",
    totalEntrants: "",
    prize: "",
    duration: "",
  });

  const [cashData, setCashData] = useState({
    buyInAmount: "",
    cashOut: "",
    duration: "",
  });

  const createSession = useMutation(api.sessions.createSession);
  const venues = useQuery(api.sessions.getUniqueVenues);

  const rebuyAmount = (parseFloat(tournamentData.buyIn) || 0) * (parseInt(tournamentData.rebuyCount) || 0);

  useEffect(() => {
    if (type === 'tournament') {
      const buyIn = parseFloat(tournamentData.buyIn) || 0;
      const rebuys = parseInt(tournamentData.rebuyCount) || 0;
      const calculatedRebuyAmount = buyIn * rebuys;
      // This is where you might want to set the rebuy amount in state if you had a field for it
      // For now, we calculate it on the fly.
    }
  }, [tournamentData.buyIn, tournamentData.rebuyCount, type]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const baseData = {
        type,
        date: new Date(formData.date).getTime(),
        venue: formData.venue,
        gameType: formData.gameType,
        notes: formData.notes || undefined,
      };

      let sessionData;
      
      if (type === "tournament") {
        const buyIn = parseFloat(tournamentData.buyIn) || 0;
        const addOnAmount = parseFloat(tournamentData.addOnAmount) || 0;
        const prize = parseFloat(tournamentData.prize) || 0;
        
        const totalCost = buyIn + rebuyAmount + addOnAmount;
        const profit = prize - totalCost;

        sessionData = {
          ...baseData,
          buyIn: buyIn || undefined,
          rebuyCount: parseInt(tournamentData.rebuyCount) || undefined,
          rebuyAmount: rebuyAmount || undefined,
          addOnCount: parseInt(tournamentData.addOnCount) || undefined,
          addOnAmount: addOnAmount || undefined,
          position: parseInt(tournamentData.position) || undefined,
          totalEntrants: parseInt(tournamentData.totalEntrants) || undefined,
          prize: prize || undefined,
          duration: parseInt(tournamentData.duration) || undefined,
          profit,
        };
      } else {
        const buyInAmount = parseFloat(cashData.buyInAmount) || 0;
        const cashOut = parseFloat(cashData.cashOut) || 0;
        const profit = cashOut - buyInAmount;

        sessionData = {
          ...baseData,
          buyInAmount: buyInAmount || undefined,
          cashOut: cashOut || undefined,
          duration: parseInt(cashData.duration) || undefined,
          profit,
        };
      }

      await createSession(sessionData);
      toast.success("Session added successfully!");
      onSuccess();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        venue: "",
        gameType: "NLH",
        notes: "",
      });
      setTournamentData({
        buyIn: "",
        rebuyCount: "",
        addOnCount: "",
        addOnAmount: "",
        position: "",
        totalEntrants: "",
        prize: "",
        duration: "",
      });
      setCashData({
        buyInAmount: "",
        cashOut: "",
        duration: "",
      });
    } catch (error) {
      toast.error("Failed to add session");
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Session</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="tournament"
                checked={type === "tournament"}
                onChange={(e) => setType(e.target.value as "tournament")}
                className="mr-2"
              />
              🏆 Tournament
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="cash"
                checked={type === "cash"}
                onChange={(e) => setType(e.target.value as "cash")}
                className="mr-2"
              />
              💰 Cash Game
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              list="venue-suggestions"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Casino name or online site"
              required
            />
            <datalist id="venue-suggestions">
              {venues?.map((venue) => (
                <option key={venue} value={venue} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Type
            </label>
            <select
              value={formData.gameType}
              onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="NLH">No Limit Hold'em</option>
              <option value="PLO">Pot Limit Omaha</option>
              <option value="LHE">Limit Hold'em</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {type === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stakes
              </label>
              <input
                type="text"
                value={cashData.stakes}
                onChange={(e) => setCashData({ ...cashData, stakes: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="$1/$2"
                required
              />
            </div>
          )}
        </div>

        {/* Tournament Specific Fields */}
        {type === "tournament" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Tournament Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy-in ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tournamentData.buyIn}
                  onChange={(e) => setTournamentData({ ...tournamentData, buyIn: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="100.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={tournamentData.duration}
                  onChange={(e) => setTournamentData({ ...tournamentData, duration: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="240"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prize Won ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tournamentData.prize}
                  onChange={(e) => setTournamentData({ ...tournamentData, prize: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Finish Position
                </label>
                <input
                  type="number"
                  value={tournamentData.position}
                  onChange={(e) => setTournamentData({ ...tournamentData, position: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Entrants
                </label>
                <input
                  type="number"
                  value={tournamentData.totalEntrants}
                  onChange={(e) => setTournamentData({ ...tournamentData, totalEntrants: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rebuys
                </label>
                <input
                  type="number"
                  value={tournamentData.rebuyCount}
                  onChange={(e) => setTournamentData({ ...tournamentData, rebuyCount: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rebuy Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rebuyAmount.toFixed(2)}
                  className="w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add-ons
                </label>
                <input
                  type="number"
                  value={tournamentData.addOnCount}
                  onChange={(e) => setTournamentData({ ...tournamentData, addOnCount: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add-on Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tournamentData.addOnAmount}
                  onChange={(e) => setTournamentData({ ...tournamentData, addOnAmount: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cash Game Specific Fields */}
        {type === "cash" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Cash Game Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy-in ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashData.buyInAmount}
                  onChange={(e) => setCashData({ ...cashData, buyInAmount: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="500.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Out ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashData.cashOut}
                  onChange={(e) => setCashData({ ...cashData, cashOut: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="750.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={cashData.duration}
                  onChange={(e) => setCashData({ ...cashData, duration: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="180"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any notes about the session..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Session
          </button>
        </div>
      </form>
    </div>
  );
}

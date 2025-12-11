import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FinishedRound } from '../types';
import { ChevronDown, ChevronUp, Calendar, User, Trophy, BarChart, X, Trash2 } from 'lucide-react';

export const PastGames: React.FC = () => {
  const { state, dispatch } = useGame();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); 
    
    if (window.confirm("Are you sure you want to PERMANENTLY delete this record?")) {
        // Reset expansion to avoid UI glitches
        if (expandedIndex === index) setExpandedIndex(null);
        dispatch({ type: 'DELETE_ROUND', payload: index });
    }
  };

  const handleClearAll = () => {
      if (window.confirm("WARNING: This will delete ALL history permanently. Are you sure?")) {
          dispatch({ type: 'CLEAR_HISTORY' });
      }
  };

  // Helper to calculate club usage for a specific round
  const getClubStats = (round: FinishedRound) => {
      const stats: Record<string, number> = {};
      let totalShots = 0;
      
      round.holes.forEach(hole => {
          hole.shots.forEach(shot => {
              stats[shot.club] = (stats[shot.club] || 0) + 1;
              totalShots++;
          });
      });
      
      // Convert to array and sort by usage (desc)
      return {
          stats: Object.entries(stats).sort(([,a], [,b]) => b - a),
          totalShots
      };
  };

  if (state.pastRounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Trophy size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No History Yet</h2>
        <p className="text-gray-500">Finish a round to see your stats here.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Game History</h2>
        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">{state.pastRounds.length} Rounds</span>
      </div>
      
      <div className="space-y-4">
        {state.pastRounds.map((round, index) => {
          const { stats: clubStats, totalShots } = getClubStats(round);
          const maxUsage = clubStats.length > 0 ? clubStats[0][1] : 0;
          
          // Use index as key fallback to ensure stability
          const key = round.id || index;

          return (
            <div key={key} className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all group">
                
                {/* --- Direct Delete Button (X) using Index --- */}
                <button
                    onClick={(e) => handleDelete(e, index)}
                    className="absolute top-0 right-0 p-3 z-20 text-gray-400 hover:text-white hover:bg-red-500 rounded-bl-2xl transition-all cursor-pointer"
                    title="Delete Record"
                    aria-label="Delete Record"
                >
                    <X size={20} />
                </button>

                {/* Card Header (Clickable for Expand) */}
                <div 
                    onClick={() => toggleExpand(index)}
                    className="p-5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors pr-12"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 pr-2">{round.courseName || 'Unknown Course'}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <Calendar size={12} /> {round.date}
                                <span className="text-gray-300">|</span>
                                <User size={12} /> {round.playerName}
                            </div>
                        </div>
                        {/* Score Display */}
                        <div className="text-right mt-1 mr-2">
                             <div className={`text-2xl font-black leading-none ${round.totalScore - round.totalPar > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                {round.totalScore}
                            </div>
                             <div className="text-xs text-gray-400 font-bold mt-1">
                                {round.totalScore - round.totalPar > 0 ? `+${round.totalScore - round.totalPar}` : round.totalScore - round.totalPar === 0 ? 'E' : round.totalScore - round.totalPar}
                            </div>
                        </div>
                    </div>
                    
                    {/* Expand Indicator */}
                    <div className="flex justify-center -mb-2">
                        {expandedIndex === index ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
                    </div>
                </div>

                {/* Expanded Details */}
                {expandedIndex === index && (
                    <div className="border-t border-gray-100 bg-gray-50 animate-fade-in">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-2 p-4 text-center border-b border-gray-200">
                            <div>
                                <div className="text-[10px] uppercase text-gray-400 font-bold">Holes</div>
                                <div className="font-bold">{round.holes.length}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-gray-400 font-bold">Putts</div>
                                <div className="font-bold">{round.totalPutts}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-gray-400 font-bold">Par</div>
                                <div className="font-bold">{round.totalPar}</div>
                            </div>
                        </div>

                        {/* Club Analysis Section */}
                        <div className="p-5 border-b border-gray-200">
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                                    <BarChart size={16} className="text-primary"/>
                                    Club Usage Analysis
                                </div>
                                <div className="text-xs text-gray-400">Total Shots: {totalShots}</div>
                             </div>
                             
                             {clubStats.length > 0 ? (
                                 <div className="space-y-3">
                                     {clubStats.map(([club, count]) => {
                                         const barWidth = maxUsage > 0 ? (count / maxUsage) * 100 : 0;
                                         return (
                                             <div key={club} className="flex items-center gap-3 text-xs">
                                                 <div className="w-16 font-medium text-gray-600 truncate text-right">{club}</div>
                                                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                     <div 
                                                        className="h-full bg-primary rounded-full" 
                                                        style={{ width: `${barWidth}%` }}
                                                     ></div>
                                                 </div>
                                                 <div className="w-6 font-bold text-gray-800 text-right">{count}</div>
                                             </div>
                                         );
                                     })}
                                 </div>
                             ) : (
                                 <div className="text-center text-gray-400 text-xs py-2">No shots recorded</div>
                             )}
                        </div>

                        {/* Scorecard Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-200 text-gray-600">
                                    <tr>
                                        <th className="py-2 text-center">Hole</th>
                                        <th className="py-2 text-center">Par</th>
                                        <th className="py-2 text-center">Score</th>
                                        <th className="py-2 text-center">Putts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {round.holes.map((h, idx) => {
                                        const diff = h.score - h.par;
                                        const scoreColor = diff < 0 ? 'text-blue-600' : diff > 0 ? 'text-red-500' : 'text-gray-900';
                                        return (
                                            <tr key={idx}>
                                                <td className="py-2 text-center font-bold text-gray-500">{h.holeNumber}</td>
                                                <td className="py-2 text-center text-gray-400">{h.par}</td>
                                                <td className={`py-2 text-center font-bold ${scoreColor}`}>{h.score}</td>
                                                <td className="py-2 text-center text-gray-500">{h.putts}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
          );
        })}
      </div>

      {/* --- Clear All History Button --- */}
      <div className="mt-8 text-center pb-8">
          <button 
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-600 font-bold border border-red-100 hover:border-red-300 px-4 py-2 rounded-lg transition-colors"
          >
              <Trash2 size={14} />
              Clear All History
          </button>
      </div>
    </div>
  );
};
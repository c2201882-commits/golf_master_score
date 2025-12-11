import React from 'react';
import { useGame } from '../context/GameContext';
import { Download, ChevronRight, Play } from 'lucide-react';

export const Analysis: React.FC = () => {
  const { state, dispatch } = useGame();

  // Stats Calcs
  const totalScore = state.history.reduce((acc, h) => acc + h.score, 0);
  const totalPar = state.history.reduce((acc, h) => acc + h.par, 0);
  const totalPutts = state.history.reduce((acc, h) => acc + h.putts, 0);
  const girCount = state.history.filter(h => h.gir).length;
  const girPercentage = state.history.length > 0 ? Math.round((girCount / state.history.length) * 100) : 0;
  const scoreDiff = totalScore - totalPar;
  const scoreDiffDisplay = scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff === 0 ? 'E' : scoreDiff;

  const downloadCSV = () => {
    if (state.history.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Hole,Par,Score,Putts,GIR,Shot Number,Club,Distance\n";
    
    state.history.forEach(h => {
        h.shots.forEach((s, idx) => {
            csvContent += `${h.holeNumber},${h.par},${h.score},${h.putts},${h.gir ? 'Y' : 'N'},${idx + 1},${s.club},${s.distance || ''}\n`;
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `golf_scorecard_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-4 pt-4 pb-safe-bottom max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Round Summary</h2>
        
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Score</div>
                <div className="text-3xl font-black text-gray-900 mt-1">{totalScore}</div>
                <div className={`text-sm font-bold ${scoreDiff > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                    {scoreDiffDisplay}
                </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Putts</div>
                <div className="text-3xl font-black text-gray-900 mt-1">{totalPutts}</div>
                <div className="text-sm text-gray-500 font-medium">Total</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">GIR</div>
                <div className="text-3xl font-black text-primary mt-1">{girPercentage}%</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Holes</div>
                <div className="text-3xl font-black text-gray-900 mt-1">{state.history.length}</div>
            </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
          <button 
             onClick={downloadCSV}
             className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md shadow-blue-200"
          >
              <Download size={18} /> Export CSV
          </button>
          
          {state.history.length < 18 && (
              <button 
                onClick={() => dispatch({ type: 'RESUME_GAME' })}
                className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md shadow-green-200"
              >
                  <Play size={18} /> Resume
              </button>
          )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                  <tr>
                      <th className="py-3 px-2 text-center">H</th>
                      <th className="py-3 px-2 text-center">Par</th>
                      <th className="py-3 px-2 text-center">Scr</th>
                      <th className="py-3 px-2 text-center">Putts</th>
                      <th className="py-3 px-2 text-center">GIR</th>
                      <th className="py-3 px-2 w-8"></th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {state.history.map((h, idx) => {
                      const diff = h.score - h.par;
                      const scoreColor = diff < 0 ? 'text-blue-600' : diff > 0 ? 'text-red-500' : 'text-gray-900';
                      return (
                          <tr 
                            key={idx} 
                            onClick={() => dispatch({ type: 'EDIT_HOLE', payload: { index: idx, data: h } })}
                            className="hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                          >
                              <td className="py-3 px-2 text-center font-bold bg-gray-50 text-gray-600">{h.holeNumber}</td>
                              <td className="py-3 px-2 text-center text-gray-500">{h.par}</td>
                              <td className={`py-3 px-2 text-center font-black ${scoreColor}`}>{h.score}</td>
                              <td className="py-3 px-2 text-center text-gray-600">{h.putts}</td>
                              <td className="py-3 px-2 text-center">
                                  {h.gir ? <span className="text-primary font-bold">✓</span> : <span className="text-gray-300">-</span>}
                              </td>
                              <td className="py-3 px-2 text-center text-gray-300">
                                  <ChevronRight size={16} />
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
          {state.history.length === 0 && (
              <div className="p-8 text-center text-gray-400">No data recorded yet.</div>
          )}
      </div>
      
      {state.history.length === 18 && (
        <div className="mt-8 mb-8">
            <button 
              onClick={() => {
                if(confirm("Start a new game? Current data will be cleared unless you exported it.")) {
                    dispatch({ type: 'RESET_GAME' });
                }
              }}
              className="w-full border-2 border-primary text-primary py-3 rounded-xl font-bold active:scale-95 transition-all"
            >
                Start New Game
            </button>
        </div>
      )}
    </div>
  );
};
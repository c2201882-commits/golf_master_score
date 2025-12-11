import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Menu, X, BarChart2, Flag, ChevronRight, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, dispatch } = useGame();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNav = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      {/* Changed p-4 to px-4 pb-3, and used custom pt-safe-top for dynamic top padding */}
      <header className="bg-primary text-white px-4 pb-3 pt-safe-top flex items-center justify-between shadow-md z-30 sticky top-0">
        <button onClick={toggleMenu} className="p-1 hover:bg-green-700 rounded transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold tracking-wide">Golf Master Pro</h1>
        <button 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'ANALYSIS' })}
          className="p-1 hover:bg-green-700 rounded transition-colors"
        >
          <BarChart2 size={24} />
        </button>
      </header>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={toggleMenu}
        />
      )}

      {/* Side Menu Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-300 shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Changed p-4 to px-4 pb-4, allowing pt-safe-top to handle top spacing */}
        <div className="px-4 pb-4 bg-primary text-white flex justify-between items-center pt-safe-top">
          <span className="font-bold text-xl">Menu</span>
          <button onClick={toggleMenu}><X size={24} /></button>
        </div>
        
        <div className="flex flex-col h-full overflow-y-auto pb-20">
          <div className="p-4 border-b">
            <button 
              onClick={() => handleNav(() => dispatch({ type: 'RESUME_GAME' }))}
              className="w-full flex items-center space-x-3 p-3 bg-green-50 text-primary rounded-xl font-semibold active:scale-95 transition-transform"
            >
              <Home size={20} />
              <span>回到目前進度 (Hole {state.maxHoleReached})</span>
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">History</h3>
            <div className="space-y-2">
              {state.history.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No holes played yet.</p>
              )}
              {state.history.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNav(() => dispatch({ type: 'EDIT_HOLE', payload: { index: idx, data: h } }))}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${state.isEditingMode && state.editingHoleIndex === idx ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="bg-gray-100 text-gray-600 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                      {h.holeNumber}
                    </span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-800">Score: {h.score}</div>
                      <div className="text-xs text-gray-500">Par {h.par}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
          
           <div className="mt-auto p-4 border-t">
            <button 
              onClick={() => handleNav(() => {
                if(confirm("Are you sure you want to reset all data?")) {
                  dispatch({ type: 'RESET_GAME' });
                }
              })}
              className="w-full p-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-lg transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto no-scrollbar pb-safe-bottom">
           {children}
        </div>
      </main>
    </div>
  );
};
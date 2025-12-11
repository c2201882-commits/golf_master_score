import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { GameState, ClubName, Shot, RoundHoleData, ViewState } from '../types';

// --- Actions ---
type Action =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'SET_BAG'; payload: ClubName[] }
  | { type: 'SET_VIEW'; payload: ViewState }
  | { type: 'START_HOLE'; payload: { hole: number; par: number } }
  | { type: 'ADD_SHOT'; payload: Shot }
  | { type: 'UPDATE_SHOT'; payload: { index: number; shot: Shot } }
  | { type: 'DELETE_SHOT'; payload: number } // Index
  | { type: 'FINISH_HOLE'; payload: RoundHoleData }
  | { type: 'EDIT_HOLE'; payload: { index: number; data: RoundHoleData } }
  | { type: 'RESUME_GAME' }
  | { type: 'RESET_GAME' };

// --- Initial State ---
const initialState: GameState = {
  view: 'BAG_SETUP',
  myBag: ["Driver", "Hybrid", "7 Iron", "8 Iron", "9 Iron", "PW", "SW", "Putter"],
  currentHole: 1,
  currentPar: 4,
  currentShots: [],
  history: [],
  isEditingMode: false,
  editingHoleIndex: -1,
  maxHoleReached: 1,
};

// --- Reducer ---
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...action.payload };
    case 'SET_BAG':
      // Only update the bag, do not change view automatically
      return { ...state, myBag: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'START_HOLE':
      return {
        ...state,
        currentHole: action.payload.hole,
        currentPar: action.payload.par,
        currentShots: [], // Clear shots for new hole
        view: 'PLAY',
        isEditingMode: false,
      };
    case 'ADD_SHOT':
      return { ...state, currentShots: [...state.currentShots, action.payload] };
    case 'UPDATE_SHOT': {
      const newShots = [...state.currentShots];
      newShots[action.payload.index] = action.payload.shot;
      return { ...state, currentShots: newShots };
    }
    case 'DELETE_SHOT': {
      const newShots = [...state.currentShots];
      newShots.splice(action.payload, 1);
      return { ...state, currentShots: newShots };
    }
    case 'FINISH_HOLE': {
      // If we are editing, update history at index
      if (state.isEditingMode && state.editingHoleIndex !== -1) {
        const newHistory = [...state.history];
        newHistory[state.editingHoleIndex] = action.payload;
        return {
          ...state,
          history: newHistory,
          isEditingMode: false,
          editingHoleIndex: -1,
          view: 'ANALYSIS', // Go to analysis to confirm changes
        };
      }

      // Normal play
      const newHistory = [...state.history, action.payload];
      const nextHole = state.currentHole + 1;
      return {
        ...state,
        history: newHistory,
        maxHoleReached: nextHole,
        currentHole: nextHole,
        currentShots: [], // clear
        view: nextHole > 18 ? 'ANALYSIS' : 'HOLE_SETUP',
      };
    }
    case 'EDIT_HOLE':
      return {
        ...state,
        isEditingMode: true,
        editingHoleIndex: action.payload.index,
        currentHole: action.payload.data.holeNumber,
        currentPar: action.payload.data.par,
        currentShots: [...action.payload.data.shots], // Deep copy shots
        view: 'PLAY',
      };
    case 'RESUME_GAME':
      return {
        ...state,
        isEditingMode: false,
        editingHoleIndex: -1,
        currentHole: state.maxHoleReached,
        currentShots: [], // Reset current shots (simplified logic)
        view: 'HOLE_SETUP',
      };
    case 'RESET_GAME':
      return { ...initialState, myBag: state.myBag }; // Keep bag settings
    default:
      return state;
  }
};

// --- Context ---
interface GameContextProps {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'golf_master_pro_v1';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
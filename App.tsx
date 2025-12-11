import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Layout } from './components/Layout';
import { BagSelection } from './components/BagSelection';
import { HoleSetup } from './components/HoleSetup';
import { PlayHole } from './components/PlayHole';
import { Analysis } from './components/Analysis';

const Main: React.FC = () => {
  const { state } = useGame();

  const renderView = () => {
    switch (state.view) {
      case 'BAG_SETUP':
        return <BagSelection />;
      case 'HOLE_SETUP':
        return <HoleSetup />;
      case 'PLAY':
        return <PlayHole />;
      case 'ANALYSIS':
        return <Analysis />;
      default:
        return <BagSelection />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <Main />
    </GameProvider>
  );
};

export default App;
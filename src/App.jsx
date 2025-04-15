// client/src/App.js
import React, { useEffect, useState } from 'react';
import { useSocket } from './context/SocketContext';
import { usePlayer } from './context/PlayerContext';
import Login from './components/Login';
import CardSelection from './components/CardSelection';
import AuctionRoom from './components/AuctionRoom';
import GameOver from './components/GameOver';

function App() {
  const { socket } = useSocket();
  const { player, setPlayer } = usePlayer();
  const [gameState, setGameState] = useState('login'); // login, cardSelection, auction, gameOver

  useEffect(() => {
    if (socket) {
      socket.on('gameState', (state) => {
        setGameState(state);
      });

      socket.on('playerUpdate', (updatedPlayer) => {
        if (updatedPlayer.id === player?.id) {
          setPlayer(updatedPlayer);
        }
      });

      // Handle card selection phase
      socket.on('selectCardsPhase', () => {
        setGameState('cardSelection');
      });

      return () => {
        socket.off('gameState');
        socket.off('playerUpdate');
        socket.off('selectCardsPhase');
      };
    }
  }, [socket, player, setPlayer]);

  // Render different components based on game state
  const renderGameComponent = () => {
    switch (gameState) {
      case 'cardSelection':
        return <CardSelection />;
      case 'auction':
        return <AuctionRoom />;
      case 'gameOver':
        return <GameOver />;
      case 'login':
      default:
        return <Login />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {renderGameComponent()}
    </div>
  );
}

export default App;
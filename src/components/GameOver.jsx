import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';
import PokemonCard from './PokemonCard';

function GameOver() {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [results, setResults] = useState({
    players: [],
    poolPokemon: [],
    currentPickingPlayer: null,
    winner: null
  });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameFinalized, setGameFinalized] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  
  useEffect(() => {
    if (socket) {
      socket.on('gameResults', (data) => {
        setResults(data);
        // Check if it's this player's turn
        setIsMyTurn(data.currentPickingPlayer && data.currentPickingPlayer.id === player?.id);
      });
      
      socket.on('pokemonRevealed', (data) => {
        setSelectedPokemon(data.pokemon);
        setShowCard(true);
      });
      
      socket.on('gameFinal', (data) => {
        setFinalResults(data);
        setGameFinalized(true);
      });
      
      return () => {
        socket.off('gameResults');
        socket.off('pokemonRevealed');
        socket.off('gameFinal');
      };
    }
  }, [socket, player]);
  
  const handlePokemonPick = (index) => {
    // Only allow picking if it's your turn and the pokemon exists at that index
    if (isMyTurn && results.poolPokemon[index] !== null) {
      console.log("Trying to pick pokemon at index:", index);
      socket.emit('pickPokemon', { index });
    } else {
      console.log("Can't pick: isMyTurn =", isMyTurn, 
                 "pokemon exists =", results.poolPokemon[index] !== null);
    }
  };

  // Show the final summary screen with all players' collections
  if (gameFinalized && finalResults) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Final Results</h1>
          
          {/* Winner Announcement */}
          {finalResults.winner && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6 text-center">
              <h2 className="text-xl font-bold text-yellow-700 mb-2">
                🏆 {finalResults.winner.name} Wins! 🏆
              </h2>
              <p className="text-gray-600">
                Final Score: <span className="font-bold">{finalResults.winner.finalScore}</span> points
              </p>
            </div>
          )}
          
          {/* Each player's final collection with detailed stats */}
          <div className="space-y-6">
            {finalResults.players.map((playerData, index) => (
              <div key={playerData.id} className={`bg-white rounded-lg shadow-sm p-6 
                ${index === 0 ? 'border-2 border-yellow-300' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    {index === 0 && <span className="text-yellow-500 mr-2">🏆</span>}
                    {index + 1}. {playerData.name}
                    {playerData.id === player?.id && <span className="ml-2 text-blue-500 text-sm">(You)</span>}
                  </h3>
                  <div className="text-right">
                    <p className="text-yellow-500 font-medium">{playerData.balance} coins</p>
                    <p className="text-sm text-gray-500">
                      Collection Value: {playerData.collectionValue} | 
                      <span className="font-bold ml-1">Total: {playerData.finalScore}</span>
                    </p>
                  </div>
                </div>
                
                {/* Player's Pokemon collection - Enhanced with details on hover */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {playerData.collection.map((pokemon, i) => (
                    <div key={i} className="aspect-square bg-gray-50 rounded-lg p-2 flex items-center justify-center relative group">
                      <div className="flex flex-col items-center">
                        <img 
                          src={pokemon.image} 
                          alt={pokemon.name} 
                          className="max-h-16 max-w-16 object-contain"
                        />
                        <p className="text-xs text-center mt-1 capitalize truncate w-full">
                          {pokemon.name}
                        </p>
                      </div>
                      
                      {/* Enhanced tooltip with price */}
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg p-1">
                        <p className="text-white text-sm capitalize font-medium px-2 text-center">
                          {pokemon.name}
                        </p>
                        <p className="text-yellow-300 text-xs font-medium">
                          {pokemon.basePrice} coins
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500">Game has ended. Thanks for playing!</p>
            <p className="text-gray-400 text-sm mt-2">New game starts in 30 seconds</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Auction Results</h1>
        
        {/* Players Ranking */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Final Standings</h2>
          <div className="space-y-2">
          {(results.players || []).sort((a, b) => b.balance - a.balance).map((player, index) => (
  <div 
    key={player.id} 
    className={`p-3 rounded-md flex items-center justify-between ${
      index === 0 ? 'bg-yellow-50' : 'bg-gray-50'
    }`}
  >
    <div className="flex items-center">
      <span className="font-medium w-6 text-center">{index + 1}</span>
      <span className={`ml-2 ${index === 0 ? 'font-bold' : ''}`}>{player.name}</span>
      {player.collection.length >= 6 && (
        <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
          Full (6/6)
        </span>
      )}
    </div>
    <div className="text-right">
      <p className="font-medium text-yellow-500">{player.balance} coins</p>
      <p className="text-xs text-gray-500">
        {player.collection.length}/6 Pokémon
      </p>
    </div>
  </div>
))}
          </div>
        </div>
        
        {/* Mystery Pool */}
        {results.poolPokemon && results.poolPokemon.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">
              Mystery Pokémon Pool
              {results.currentPickingPlayer && (
                <span className="ml-2 text-sm font-normal text-blue-500">
                  {results.currentPickingPlayer.name}'s turn to pick
                </span>
              )}
            </h2>
            
            {/* Current Player Indicator */}
            {isMyTurn && (
              <div className="bg-blue-50 p-3 mb-4 rounded-md text-blue-700 text-center">
                It's your turn to pick a card!
              </div>
            )}
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {results.poolPokemon.map((pokemon, index) => (
                <div 
                  key={index}
                  onClick={() => handlePokemonPick(index)}
                  className={`aspect-square ${
                    pokemon 
                      ? isMyTurn 
                        ? 'bg-gray-100 hover:bg-blue-50 cursor-pointer' 
                        : 'bg-gray-100'
                      : 'bg-gray-200'
                  } rounded-lg flex items-center justify-center transition ${
                    !pokemon ? 'opacity-50 cursor-not-allowed' : 
                    isMyTurn ? 'cursor-pointer hover:shadow-md' : ''
                  }`}
                >
                  {pokemon ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pokemon Reveal Modal - Shown to all players */}
        {showCard && selectedPokemon && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
              <h3 className="text-lg font-bold mb-4">
                {results.currentPickingPlayer?.name} got a new Pokémon!
              </h3>
              <div className="flex justify-center mb-4">
                <div className="bg-gray-50 rounded-full p-4 inline-block">
                  <PokemonCard pokemon={selectedPokemon} />
                </div>
              </div>
              <p className="text-lg font-medium capitalize mb-4">{selectedPokemon.name}</p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={() => setShowCard(false)}
              >
                Nice!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameOver;
// client/src/components/PlayerSection.js
import React from 'react';

function PlayerSection({ players, currentPlayer, currentBidderTurn }) {
  return (
    <div className="space-y-4 overflow-y-auto max-h-96">
      {players.map(player => {
        const isCurrentBidder = player.name === currentBidderTurn;
        
        return (
          <div 
            key={player.id} 
            className={`rounded-lg overflow-hidden shadow-sm transition ${
              player.id === currentPlayer?.id ? 'ring-2 ring-blue-400' : ''
            } ${isCurrentBidder ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
          >
            <div className={`${isCurrentBidder ? 'bg-yellow-50' : 'bg-white'} p-4`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`font-medium ${
                  player.id === currentPlayer?.id ? 'text-blue-600' : 
                  isCurrentBidder ? 'text-yellow-600' : 'text-gray-700'
                }`}>
                  {player.name}
                  {isCurrentBidder && (
                    <span className="inline-block ml-2 text-yellow-500 animate-pulse">●</span>
                  )}
                </h3>
                <span className="text-yellow-500 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {player.balance}
                </span>
              </div>

              {/* Player stats row - Order, Skips */}
              <div className="flex justify-between mb-2 text-xs text-gray-500">
                <span>Order: <b>#{player.bidPosition || '?'}</b></span>
                <span>Skips: <b>{player.skipsLeft}</b>/2</span>
              </div>

              {player.collection.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {player.collection.map((pokemon, index) => (
                    <div key={index} className="aspect-square bg-gray-50 rounded-md p-1 flex items-center justify-center relative group">
                      <img 
                        src={pokemon.image} 
                        alt={pokemon.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                      
                      {/* Tooltip that appears on hover */}
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-1 truncate capitalize">
                        {pokemon.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No Pokémon yet</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PlayerSection;
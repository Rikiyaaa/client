import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';
import PlayerSection from './PlayerSection';
import PokemonCard from './PokemonCard';
import AuctionStatus from './AuctionStatus';
import BiddingControls from './BiddingControls';
import ResetGameButton from './ResetGameButton';

function AuctionRoom() {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [auctionData, setAuctionData] = useState({
    currentPokemon: null,
    currentBid: 0,
    currentBidder: null,
    timeLeft: 30,
    players: [],
    pokemonLeft: 18,
    biddingOrder: [],
    currentBidderTurn: null,
    isPreviewMode: false
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  useEffect(() => {
    if (socket) {
      socket.on('auctionUpdate', (data) => {
        setAuctionData(data);
        
        // Update preview mode state
        if (data.isPreviewMode) {
          setIsPreviewMode(true);
        } else {
          setIsPreviewMode(false);
        }
        
        // Check if it's this player's turn to bid
        setIsYourTurn(data.currentBidderTurn === player?.name);
      });
      
      socket.on('bidNotification', (message) => {
        setNotifications(prev => [...prev, message].slice(-5));
      });
      
      socket.on('confirmPurchase', () => {
        setShowConfirmation(true);
      });
      
      socket.on('yourTurnToBid', () => {
        // Notification or sound to alert player it's their turn
        if (player) {
          // You could play a sound here if needed
          // Force isYourTurn to true even if the auctionData hasn't updated yet
          setIsYourTurn(true);
        }
      });
      
      return () => {
        socket.off('auctionUpdate');
        socket.off('bidNotification');
        socket.off('confirmPurchase');
        socket.off('yourTurnToBid');
      };
    }
  }, [socket, player]);

  // Define handler functions
  const handleBid = (amount) => {
    if (socket && isYourTurn && !auctionData.isPreviewMode) {
      socket.emit('placeBid', { amount });
    }
  };
  
  const handleSkip = () => {
    if (socket && isYourTurn && !auctionData.isPreviewMode) {
      socket.emit('skipBid');
    }
  };
  
  // Add new function to handle pass
  const handlePass = () => {
    if (socket && isYourTurn && !auctionData.isPreviewMode) {
      socket.emit('passBid');
    }
  };
  
  const handlePurchaseConfirmation = (confirmed) => {
    setShowConfirmation(false);
    if (socket) {
      socket.emit('confirmPurchase', { confirm: confirmed });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Pokémon Auction</h1>
          <p className="text-sm text-gray-500">Remaining Pokémon: {auctionData.pokemonLeft}</p>
          
          {/* Preview Mode Banner */}
          {auctionData.isPreviewMode && (
            <div className="mt-2 bg-purple-100 text-purple-800 py-1 px-3 rounded-full inline-block text-sm font-medium">
              Preview Mode: The current Pokémon is too expensive for all players
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Players */}
          <div className="col-span-3">
            <PlayerSection 
              players={auctionData.players.filter((p, i) => i % 2 === 0)} 
              currentPlayer={player}
              currentBidderTurn={auctionData.currentBidderTurn}
            />
          </div>
          
          {/* Center - Current Pokemon Auction */}
          <div className="col-span-6 flex flex-col items-center">
            {/* Current Pokemon */}
            <div className="w-full bg-white rounded-lg shadow-sm p-6 mb-4 flex flex-col items-center">
              {auctionData.currentPokemon ? (
                <>
                  <PokemonCard pokemon={auctionData.currentPokemon} />
                  <p className="mt-2 text-lg font-medium capitalize">{auctionData.currentPokemon.name}</p>
                  
                  {/* Base Price Display */}
                  <p className="mt-1 text-yellow-500 font-medium">
                    Base Price: {auctionData.currentPokemon.basePrice} coins
                  </p>
                  
                  {/* Preview Mode Timer */}
                  {auctionData.isPreviewMode && (
                    <p className="mt-2 text-purple-600 text-sm animate-pulse">
                      Preview ends in {auctionData.timeLeft}s
                    </p>
                  )}
                </>
              ) : (
                <div className="h-48 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Waiting for next Pokémon...</p>
                </div>
              )}
            </div>
            
            {/* Auction Status */}
            <AuctionStatus 
  currentPokemon={auctionData.currentPokemon}
  currentBid={auctionData.currentBid}
  currentBidder={auctionData.currentBidder}
  timeLeft={auctionData.timeLeft}
  currentBidderTurn={auctionData.currentBidderTurn}
  isPreviewMode={auctionData.isPreviewMode}
/>
            
            {/* Your Turn Indicator - only show when not in preview mode */}
            {isYourTurn && !auctionData.isPreviewMode && (
              <div className="w-full mt-4 bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="font-bold text-blue-700">YOUR TURN TO BID!</p>
                </div>
              </div>
            )}
            
            {/* Notifications */}
            <div className="w-full mt-4 bg-white rounded-lg shadow-sm p-4 max-h-28 overflow-y-auto">
              {notifications.map((msg, i) => (
                <p key={i} className={`text-sm mb-1 ${i === notifications.length - 1 ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                  {msg}
                </p>
              ))}
            </div>
          </div>
          
          {/* Right Players */}
          <div className="col-span-3">
            <PlayerSection 
              players={auctionData.players.filter((p, i) => i % 2 === 1)} 
              currentPlayer={player}
              currentBidderTurn={auctionData.currentBidderTurn}
            />
          </div>
        </div>
        
        {/* Bottom - Player Controls - Disable bidding in preview mode */}
        <div className="mt-6">
          <BiddingControls 
            onBid={handleBid}
            onSkip={handleSkip}
            onPass={handlePass} // Add the new pass handler
            currentBid={auctionData.currentBid}
            playerBalance={player?.balance || 0}
            skipsLeft={player?.skipsLeft || 0}
            isYourTurn={isYourTurn}
            isPreviewMode={auctionData.isPreviewMode}
          />
        </div>
      </div>
      
      {/* Purchase Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Purchase</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to purchase {auctionData.currentPokemon?.name} for {auctionData.currentBid} coins?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => handlePurchaseConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Decline
              </button>
              <button 
                onClick={() => handlePurchaseConfirmation(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionRoom;
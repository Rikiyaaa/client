import React, { useState } from 'react';

function BiddingControls({ 
  onBid, 
  onSkip,
  onPass, // New prop for pass functionality
  currentBid, 
  playerBalance, 
  skipsLeft, 
  isYourTurn,
  isPreviewMode
}) {
  // Change to use preset bid amounts only (50, 100, 150, 200)
  const [bidAmount, setBidAmount] = useState(50);
  
  // Preset bid amounts - updated range
  const presetBids = [50, 100, 150, 200];
  
  // Calculate if player can afford to bid
  const canBid = playerBalance >= currentBid + bidAmount;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Preview Mode Banner */}
      {isPreviewMode ? (
        <div className="text-center p-3 bg-purple-50 rounded-md mb-4">
          <p className="text-purple-800 font-medium">Preview Mode Active</p>
          <p className="text-sm text-purple-600">Bidding is disabled as no player can afford this Pokémon</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Balance</p>
              <p className="text-xl font-bold text-yellow-500">{playerBalance} coins</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Minimum Bid</p>
              <p className="text-xl font-bold text-gray-800">{currentBid} coins</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Skips Left</p>
              <p className="text-xl font-bold text-blue-500">{skipsLeft}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Bid amount selection */}
            <div className="grid grid-cols-4 gap-2">
              {presetBids.map(amount => (
                <button
                  key={amount}
                  onClick={() => setBidAmount(amount)}
                  className={`py-2 px-3 rounded-md transition ${
                    bidAmount === amount
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  +{amount}
                </button>
              ))}
            </div>
            
            {/* Explanation of the actions */}
            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-2">
              <p><strong>Skip:</strong> Skip your turn completely for this Pokémon (you won't bid again)</p>
              <p><strong>Pass:</strong> Pass this turn, but stay in the bidding cycle</p>
              <p><strong>Bid:</strong> Add {bidAmount} coins to the current bid</p>
            </div>
            
            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSkip()}
                disabled={!isYourTurn || skipsLeft <= 0}
                className={`py-2 px-4 rounded-md transition ${
                  isYourTurn && skipsLeft > 0
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Skip this Pokémon auction completely"
              >
                Skip ({skipsLeft})
              </button>
              <button
                onClick={() => onPass()}
                disabled={!isYourTurn}
                className={`py-2 px-4 rounded-md transition ${
                  isYourTurn
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Pass this turn but stay in bidding cycle"
              >
                Pass
              </button>
              <button
                onClick={() => onBid(bidAmount)}
                disabled={!isYourTurn || !canBid}
                className={`py-2 px-4 rounded-md transition ${
                  isYourTurn && canBid
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Bid {bidAmount}
              </button>
            </div>
          </div>
          
          {/* Error message if player can't afford */}
          {isYourTurn && !canBid && (
            <p className="mt-2 text-red-500 text-sm">
              You don't have enough coins for this bid. 
              {playerBalance < currentBid ? " You can't even meet the minimum bid." : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default BiddingControls;
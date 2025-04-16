// client/src/components/StartAuctionVote.js
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';

function StartAuctionVote() {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [votes, setVotes] = useState(0);
  const [votesNeeded, setVotesNeeded] = useState(0);
  const [voters, setVoters] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('auctionVoteUpdate', (data) => {
      setVotes(data.votes);
      setVotesNeeded(data.needed);
      setVoters(data.voters);
      
      // ตรวจสอบว่าผู้เล่นปัจจุบันได้โหวตแล้วหรือไม่
      if (player && data.voters.includes(player.name)) {
        setHasVoted(true);
      }
    });

    return () => {
      socket.off('auctionVoteUpdate');
    };
  }, [socket, player]);

  const handleVote = () => {
    if (!socket || hasVoted) return;
    
    socket.emit('voteStartAuction');
    setHasVoted(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mt-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Start Auction Vote</h2>
        <p className="mt-2 text-sm text-gray-500">
          All players have selected cards! Vote to start the auction.
        </p>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="mb-4 w-full bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Vote Progress:</span>
            <span className="text-blue-600 font-bold">{votes}/{votesNeeded}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${votesNeeded > 0 ? (votes / votesNeeded) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        {voters.length > 0 && (
          <div className="w-full mb-4 text-center">
            <p className="text-sm text-gray-500">
              Voters: {voters.join(', ')}
            </p>
          </div>
        )}
        
        <button
          onClick={handleVote}
          disabled={hasVoted}
          className={`mt-2 py-2 px-6 rounded-md transition ${
            hasVoted 
              ? 'bg-gray-300 cursor-not-allowed text-gray-600' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {hasVoted ? 'Vote Submitted' : 'Vote to Start Auction'}
        </button>
      </div>
    </div>
  );
}

export default StartAuctionVote;

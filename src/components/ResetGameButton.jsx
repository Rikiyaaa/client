// client/src/components/ResetGameButton.js
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

function ResetGameButton() {
  const { socket } = useSocket();
  const [votes, setVotes] = useState(0);
  const [votesNeeded, setVotesNeeded] = useState(0);
  const [voters, setVoters] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('resetVoteUpdate', (data) => {
      setVotes(data.votes);
      setVotesNeeded(data.needed);
      setVoters(data.voters);
      
      // Check if this player has voted
      const playerName = localStorage.getItem('playerName');
      setHasVoted(data.voters.includes(playerName));
    });

    return () => {
      socket.off('resetVoteUpdate');
    };
  }, [socket]);

  const handleVoteReset = () => {
    if (hasVoted || !socket) return;
    socket.emit('voteReset');
    setHasVoted(true);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleVoteReset}
        disabled={hasVoted}
        className={`px-3 py-2 rounded-md text-sm ${
          hasVoted
            ? 'bg-gray-300 text-gray-700'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        {hasVoted ? 'Vote Cast' : 'Vote to Reset Game'}
      </button>
      
      {votes > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <p>
            Reset votes: {votes}/{votesNeeded} needed
          </p>
          <p>Voters: {voters.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default ResetGameButton;
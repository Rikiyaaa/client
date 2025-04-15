// client/src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';

function Login() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { socket } = useSocket();
  const { setPlayer, player } = usePlayer();
  
  // Reset vote state
  const [votes, setVotes] = useState(0);
  const [votesNeeded, setVotesNeeded] = useState(0);
  const [voters, setVoters] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);

  // ตรวจสอบ local storage สำหรับชื่อผู้เล่นที่บันทึกไว้
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setName(savedName);
      setIsReconnecting(true);
      // ลองเชื่อมต่อใหม่อัตโนมัติ
      if (socket) {
        attemptReconnect(savedName);
      }
    }
  }, [socket]);
  
  // Listen for reset vote updates
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

  const attemptReconnect = (playerName) => {
    setIsJoining(true);
    socket.emit('joinGame', { name: playerName }, (response) => {
      if (response.success) {
        // บันทึกข้อมูลผู้เล่นและข้อมูลเกม
        setPlayer({
          ...response.player,
          cardValue: response.cardValue,
          gameState: response.gameState,
          auctionState: response.auctionState
        });
        
        // บันทึกชื่อลง local storage
        localStorage.setItem('playerName', playerName);
        
        setMessage(response.message || 'Reconnected to game!');
      } else {
        setMessage(response.message || 'Failed to reconnect. Try again.');
        setIsJoining(false);
        setIsReconnecting(false);
        
        // If game in progress, show reset option
        if (response.message && response.message.includes('Game already in progress')) {
          setShowResetOption(true);
        }
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (name.trim() !== '') {
      setIsJoining(true);
      
      // บันทึกชื่อลง local storage สำหรับการเชื่อมต่อใหม่
      localStorage.setItem('playerName', name);

      socket.emit('joinGame', { name }, (response) => {
        if (response.success) {
          setPlayer({
            ...response.player,
            gameState: response.gameState
          });
          setMessage(response.message || 'Joined successfully! Waiting for the game to start...');
        } else {
          setMessage(response.message || 'Failed to join the game.');
          setIsJoining(false);
          
          // If game in progress, show reset option
          if (response.message && response.message.includes('Game already in progress')) {
            setShowResetOption(true);
          }
        }
      });
    }
  };
  
  const handleVoteReset = () => {
    if (hasVoted || !socket || !name.trim()) return;
    
    // Send vote with player name
    socket.emit('voteResetFromJoinScreen', { playerName: name });
    setHasVoted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Pokémon Auction</h1>
            <p className="mt-2 text-sm text-gray-500">
              {isReconnecting ? 'Reconnecting to game...' : 'Enter your name to join'}
            </p>
          </div>
          
          {message && (
            <div className={`p-3 rounded-md mb-6 text-sm ${
              message.includes('Failed') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isJoining}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your trainer name"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition disabled:bg-blue-300"
            >
              {isJoining ? (isReconnecting ? 'Reconnecting...' : 'Joining...') : 'Join Auction'}
            </button>
          </form>
          
          {/* Show reset game option if game is in progress */}
          {showResetOption && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 font-medium mb-2">Game in progress</p>
              <p className="text-sm text-yellow-700 mb-3">
                The game is already in progress. You can vote to reset the game if you think it's stuck.
              </p>
              
              <div className="mt-4">
                <button
                  onClick={handleVoteReset}
                  disabled={hasVoted || !name.trim()}
                  className={`px-3 py-2 rounded-md text-sm ${
                    hasVoted || !name.trim()
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
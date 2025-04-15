// client/src/components/CardSelection.js
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';

function CardSelection() {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardValues, setCardValues] = useState([null, null, null]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [revealedValue, setRevealedValue] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on('cardRevealed', (data) => {
        // อัปเดตค่าการ์ดที่เปิดเผย
        if (data.playerId === player?.id) {
          setRevealedValue(data.value);
          const newCardValues = [...cardValues];
          newCardValues[data.cardIndex] = data.value;
          setCardValues(newCardValues);
          setIsSelecting(false);
        }
      });

      return () => {
        socket.off('cardRevealed');
      };
    }
  }, [socket, player, cardValues]);

  // เพิ่ม effect เพื่อตรวจสอบค่าการ์ดเมื่อเชื่อมต่อใหม่
  useEffect(() => {
    if (player?.cardValue) {
      setRevealedValue(player.cardValue);
      const newCardValues = [...cardValues];
      newCardValues[0] = player.cardValue; // ใช้ slot แรกสำหรับค่าที่เชื่อมต่อใหม่
      setCardValues(newCardValues);
    }
  }, [player]);

  const handleCardSelect = (index) => {
    // ห้ามเลือกถ้ามีการเลือกแล้ว
    if (isSelecting || revealedValue !== null) return;
    
    setIsSelecting(true);
    setSelectedCard(index);
    
    socket.emit('selectCard', { cardIndex: index }, (response) => {
      if (!response.success) {
        setSelectedCard(null);
        setIsSelecting(false);
      }
    });
  };

  // หากมีค่าการ์ดที่เปิดเผยแล้ว แสดงเฉพาะการ์ดนั้น
  if (revealedValue !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Your Bidding Position</h1>
              <p className="mt-2 text-sm text-gray-500">Waiting for other players...</p>
            </div>
            
            <div className="flex justify-center my-8">
              <div className="w-24 h-32 rounded-lg flex items-center justify-center bg-blue-500 text-white">
                <span className="text-2xl font-bold">{revealedValue}</span>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Your bidding position: {revealedValue}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Select a Card</h1>
            <p className="mt-2 text-sm text-gray-500">This will determine your bidding order</p>
          </div>
          
          <div className="flex justify-center space-x-6 my-8">
            {[0, 1, 2].map((index) => (
              <div 
                key={index}
                onClick={() => handleCardSelect(index)}
                className={`
                  w-24 h-32 rounded-lg flex items-center justify-center cursor-pointer transition 
                  transform hover:scale-105 ${selectedCard === index ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}
                  ${cardValues[index] !== null ? 'bg-blue-500 text-white' : 'bg-gray-100'}
                `}
              >
                {cardValues[index] !== null ? (
                  <span className="text-2xl font-bold">{cardValues[index]}</span>
                ) : (
                  <span className="text-4xl font-bold text-gray-400">?</span>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSelecting ? 'Waiting for result...' : 'Select one card to reveal your bidding position'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CardSelection;
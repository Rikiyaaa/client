import React, { useEffect, useState } from 'react';

function AuctionStatus({
  currentPokemon,
  currentBid,
  currentBidder,
  timeLeft,
  currentBidderTurn,
  isPreviewMode
}) {
  // เพิ่มตัวแปรเพื่อเก็บเวลาเริ่มต้น
  const [initialTime, setInitialTime] = useState(30);
  
  // คำนวณเปอร์เซ็นต์ของเวลาที่เหลือ
  const percentage = Math.max(0, (timeLeft / initialTime) * 100);
  
  // กำหนดสีตามเวลาที่เหลือ
  const getBarColor = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // อัพเดตเวลาเริ่มต้นเมื่อมีการเริ่มประมูลใหม่หรือรีเซ็ตเวลา
  useEffect(() => {
    if (timeLeft === 30) {
      setInitialTime(30);
    } else if (isPreviewMode && timeLeft === 10) {
      setInitialTime(10);
    }
  }, [timeLeft, isPreviewMode]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col">
        {/* Current Bid and Bidder */}
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-xl font-bold text-yellow-500">{currentBid} coins</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Highest Bidder</p>
            <p className="text-xl font-bold text-blue-600">{currentBidder || 'None'}</p>
          </div>
        </div>
        
        {/* Next Bidder */}
        <div className="mb-3">
          <p className="text-sm text-gray-500">Next Bidder</p>
          <p className="font-medium text-gray-800">{currentBidderTurn || (isPreviewMode ? 'Preview Mode' : 'Waiting...')}</p>
        </div>
        
        {/* Time Left - Countdown Bar */}
        <div className="mb-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Time Left</span>
            <span className="text-sm font-bold text-gray-700">{timeLeft}s</span>
          </div>
        </div>
        
        {/* Progress Bar - เพิ่มส่วนนี้ */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full ${getBarColor()} transition-all duration-500 ease-linear`} 
            style={{ width: `${percentage}%` }}
          >
            {/* เพิ่มเอฟเฟกต์การเต้นเมื่อเวลาเหลือน้อย */}
            {percentage <= 20 && (
              <div className="w-full h-full opacity-50 bg-white animate-pulse"></div>
            )}
          </div>
        </div>
        
        {/* แสดงข้อความเตือนเมื่อเวลาเหลือน้อย */}
        {percentage <= 20 && !isPreviewMode && (
          <p className="text-xs text-red-500 font-medium mt-1 animate-pulse">
            Time is running out!
          </p>
        )}
      </div>
    </div>
  );
}

export default AuctionStatus;
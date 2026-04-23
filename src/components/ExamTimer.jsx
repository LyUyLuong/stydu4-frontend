import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ExamTimer Component
 * Displays a countdown timer for exam sessions
 * Auto-submits when time expires
 */
function ExamTimer({ expiryTime, onExpire, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (!expiryTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeLeft(0);
        if (!hasExpired) {
          setHasExpired(true);
          onExpire();
        }
        return;
      }

      setTimeLeft(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, onExpire, hasExpired]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const time = formatTime(timeLeft);
  const isLowTime = timeLeft < 5 * 60 * 1000; // Less than 5 minutes
  const isCriticalTime = timeLeft < 1 * 60 * 1000; // Less than 1 minute

  return (
    <div className={`exam-timer ${className}`}>
      <div className={`flex items-center gap-3 ${
        isCriticalTime 
          ? 'text-red-600 animate-pulse' 
          : isLowTime 
          ? 'text-orange-600' 
          : 'text-gray-900'
      }`}>
        {/* Clock Icon */}
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>

        {/* Time Display */}
        <div className="flex flex-col">
          <span className="text-xs font-medium opacity-75">Time Remaining</span>
          <span className="text-2xl font-bold tabular-nums">
            {time.formatted}
          </span>
        </div>
      </div>

      {/* Warning Messages */}
      {isCriticalTime && timeLeft > 0 && (
        <div className="mt-2 text-sm text-red-600 font-medium">
          ⚠️ Less than 1 minute remaining!
        </div>
      )}
      {isLowTime && !isCriticalTime && (
        <div className="mt-2 text-sm text-orange-600 font-medium">
          ⏰ Less than 5 minutes remaining
        </div>
      )}
    </div>
  );
}

ExamTimer.propTypes = {
  expiryTime: PropTypes.string.isRequired,
  onExpire: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ExamTimer;

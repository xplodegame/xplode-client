import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  endTime: number;
  isActive: boolean;
  className?: string;
}

const CountdownTimer = ({ 
  endTime, 
  isActive,
  className = ""
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, isActive]);

  if (!isActive || timeLeft === 0) return null;

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <Timer size={16} className="animate-pulse" />
      <span>{timeLeft}s</span>
    </div>
  );
};

export default CountdownTimer;
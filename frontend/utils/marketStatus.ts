export function isMarketOpen(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  
  const day = istTime.getUTCDay();
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  
  if (day === 0 || day === 6) {
    return false;
  }
  
  const marketStartTime = 9 * 60 + 15;
  const marketEndTime = 15 * 60 + 30;
  const currentTimeInMinutes = hours * 60 + minutes;
  
  return currentTimeInMinutes >= marketStartTime && currentTimeInMinutes <= marketEndTime;
}

export function getMarketStatus(): {
  isOpen: boolean;
  message: string;
} {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const day = istTime.getUTCDay();
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  
  if (day === 0 || day === 6) {
    return {
      isOpen: false,
      message: "Market is closed on weekends"
    };
  }
  
  const currentTimeInMinutes = hours * 60 + minutes;
  const marketStartTime = 9 * 60 + 15;
  const marketEndTime = 15 * 60 + 30;
  
  const open = currentTimeInMinutes >= marketStartTime && currentTimeInMinutes <= marketEndTime;
  
  if (!open) {
    if (currentTimeInMinutes < marketStartTime) {
      return {
        isOpen: false,
        message: "Market will open at 9:15 AM IST"
      };
    } else {
      return {
        isOpen: false,
        message: "Market closed at 3:30 PM IST"
      };
    }
  }
  
  return {
    isOpen: true,
    message: "Market is open"
  };
}

interface Quote {
  ltp: number;
  bid: number;
  ask: number;
  volume: number;
  oi: number;
}

export async function getQuote(symbol: string): Promise<Quote> {
  const basePrice = Math.random() * 1000 + 100;
  
  return {
    ltp: parseFloat(basePrice.toFixed(2)),
    bid: parseFloat((basePrice * 0.98).toFixed(2)),
    ask: parseFloat((basePrice * 1.02).toFixed(2)),
    volume: Math.floor(Math.random() * 100000),
    oi: Math.floor(Math.random() * 1000000),
  };
}

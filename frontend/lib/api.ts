const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // Market Data APIs
  getOptionChain: async (index: string, expiryDate: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/market-data/option-chain?instrument_key=${index}&expiry_date=${expiryDate}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch option chain');
    }
    return response.json();
  },

  getLTP: async (symbols: string[]) => {
    const symbolsParam = symbols.join(',');
    const response = await fetch(
      `${API_BASE_URL}/api/market-data/ltp?symbols=${symbolsParam}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch LTP');
    }
    return response.json();
  },

  getQuote: async (symbols: string[]) => {
    const symbolsParam = symbols.join(',');
    const response = await fetch(
      `${API_BASE_URL}/api/market-data/quote?symbols=${symbolsParam}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    return response.json();
  },

  // Paper Trading APIs
  getPortfolio: async () => {
    const response = await fetch(`${API_BASE_URL}/api/paper-trading/portfolio`);
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  },

  placeOrder: async (orderData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/paper-trading/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error('Failed to place order');
    }
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/api/paper-trading/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },
};

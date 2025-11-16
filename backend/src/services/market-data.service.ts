import axios from 'axios';

export class MarketDataService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    this.apiSecret = process.env.API_SECRET || '';
    this.baseUrl = process.env.API_BASE_URL || '';
  }

  // Fetch current market price
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/price`, {
        params: { symbol },
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret
        }
      });
      return response.data.price;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  // Fetch historical data
  async getHistoricalData(symbol: string, interval: string) {
    const response = await axios.get(`${this.baseUrl}/historical`, {
      params: { symbol, interval },
      headers: {
        'X-API-Key': this.apiKey
      }
    });
    return response.data;
  }
}

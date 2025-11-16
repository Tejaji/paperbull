import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const UPSTOX_BASE_URL = 'https://api.upstox.com/v2';

interface TokenData {
  access_token: string;
  saved_at: string;
}

class UpstoxService {
  private accessToken: string | null = null;
  private tokenFilePath = path.join(__dirname, '../../.upstox-token.json');

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    try {
      if (fs.existsSync(this.tokenFilePath)) {
        const data: TokenData = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf8'));
        this.accessToken = data.access_token;
        console.log('✅ Upstox token loaded from file');
      }
    } catch (error) {
      console.log('ℹ️  No saved token found');
    }
  }

  private saveToken(token: string) {
    try {
      const data: TokenData = {
        access_token: token,
        saved_at: new Date().toISOString()
      };
      fs.writeFileSync(this.tokenFilePath, JSON.stringify(data, null, 2));
      console.log('✅ Token saved successfully');
    } catch (error) {
      console.error('❌ Error saving token:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  getLoginUrl(): string {
    const apiKey = process.env.UPSTOX_API_KEY;
    const redirectUri = process.env.UPSTOX_REDIRECT_URI;
    
    if (!apiKey || !redirectUri) {
      throw new Error('UPSTOX_API_KEY or UPSTOX_REDIRECT_URI not configured');
    }

    return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  async authenticate(authCode: string): Promise<void> {
    try {
      const response = await axios.post(
        `${UPSTOX_BASE_URL}/login/authorization/token`,
        new URLSearchParams({
          code: authCode,
          client_id: process.env.UPSTOX_API_KEY!,
          client_secret: process.env.UPSTOX_API_SECRET!,
          redirect_uri: process.env.UPSTOX_REDIRECT_URI!,
          grant_type: 'authorization_code'
        }),
        {
          headers: {
            'accept': 'application/json',
            'Api-Version': '2.0',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      
      // ✅ FIX: Check that accessToken is not null before saving
      if (this.accessToken) {
        this.saveToken(this.accessToken);
      }
      
      console.log('✅ Upstox authentication successful');
    } catch (error: any) {
      console.error('❌ Authentication error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Upstox');
    }
  }

  private async makeRequest(endpoint: string, params?: any): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please authenticate first via /auth/upstox/login');
    }

    try {
      const response = await axios.get(`${UPSTOX_BASE_URL}${endpoint}`, {
        params,
        headers: {
          'Accept': 'application/json',
          'Api-Version': '2.0',
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.accessToken = null;
        if (fs.existsSync(this.tokenFilePath)) {
          fs.unlinkSync(this.tokenFilePath);
        }
        throw new Error('Token expired. Please re-authenticate via /auth/upstox/login');
      }
      throw error;
    }
  }

  async getMarketQuote(symbols: string[]): Promise<any> {
    const symbolParam = symbols.join(',');
    return this.makeRequest('/market-quote/quotes', { symbol: symbolParam });
  }

  async getLTP(symbols: string[]): Promise<any> {
    const symbolParam = symbols.join(',');
    return this.makeRequest('/market-quote/ltp', { symbol: symbolParam });
  }

  async getOptionChain(instrumentKey: string, expiryDate: string): Promise<any> {
    return this.makeRequest('/option/chain', {
      instrument_key: instrumentKey,
      expiry_date: expiryDate
    });
  }

  async getHistoricalData(
    instrumentKey: string,
    interval: string,
    toDate: string,
    fromDate: string
  ): Promise<any> {
    return this.makeRequest(
      `/historical-candle/${instrumentKey}/${interval}/${toDate}/${fromDate}`
    );
  }
}

export const upstoxService = new UpstoxService();

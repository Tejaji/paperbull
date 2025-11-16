import WebSocket from 'ws';

export class MarketDataWebSocket {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;

  connect(onMessage: (data: any) => void) {
    const wsUrl = `${process.env.WS_API_URL}?apiKey=${process.env.API_KEY}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.on('open', () => {
      console.log('WebSocket connected');
      // Subscribe to market data streams
      this.subscribe(['AAPL', 'GOOGL', 'MSFT']);
    });

    this.ws.on('message', (data: string) => {
      const parsedData = JSON.parse(data);
      onMessage(parsedData);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket closed, reconnecting...');
      setTimeout(() => this.connect(onMessage), this.reconnectInterval);
    });
  }

  subscribe(symbols: string[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        symbols: symbols
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

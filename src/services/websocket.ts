import type { WebsocketMessage } from '../types/websocket';

export class BinanceWebsocketService {
  private websocket: WebSocket | null = null;
  private messageHandlers: ((message: WebsocketMessage) => void)[] = [];
  
  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.addMessageHandler = this.addMessageHandler.bind(this);
    this.removeMessageHandler = this.removeMessageHandler.bind(this);
  }

  connect(symbols: string[]): void {
    if (this.websocket) {
      this.disconnect();
    }

    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const url = `wss://data-stream.binance.com/stream?streams=${streams}`;

    try {
      this.websocket = new WebSocket(url);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connection established');
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebsocketMessage;
          this.messageHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Error parsing websocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  addMessageHandler(handler: (message: WebsocketMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: WebsocketMessage) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index !== -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
  }
}

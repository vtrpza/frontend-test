import type { TickerData } from './index';

export interface WebsocketMessage {
  stream: string;
  data: TickerData;
}

'use client';

import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const subscribers = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectTimeout = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    function connect() {
      try {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
            
            if (data.channel) {
              const channelSubs = subscribers.current.get(data.channel);
              if (channelSubs) {
                channelSubs.forEach(callback => callback(data));
              }
            }
          } catch (error) {
            console.warn('Failed to parse WebSocket message:', error);
          }
        };

        ws.current.onclose = () => {
          console.log('WebSocket disconnected, will retry in 3s...');
          setIsConnected(false);
          
          // Auto-reconnect after 3 seconds
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, 3000);
        };

        ws.current.onerror = () => {
          console.warn('WebSocket connection error (will retry)');
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
      }
    }

    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, [url]);

  const subscribe = (channels: string[], callback: (data: any) => void) => {
    channels.forEach(channel => {
      if (!subscribers.current.has(channel)) {
        subscribers.current.set(channel, new Set());
      }
      subscribers.current.get(channel)!.add(callback);
    });

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'subscribe', channels }));
    }

    return () => {
      channels.forEach(channel => {
        subscribers.current.get(channel)?.delete(callback);
      });
    };
  };

  return { isConnected, lastMessage, subscribe };
}

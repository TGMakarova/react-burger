/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { WebSocketMessage } from '@/utils/types';
import type {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
} from '@reduxjs/toolkit';
import type { Middleware } from 'redux';

// Делаем тип generic, чтобы он мог принимать разные типы сообщений
export type TwsActionTypes<TMessage = WebSocketMessage> = {
  wsConnect: ActionCreatorWithPayload<string>;
  wsDisconnect: ActionCreatorWithoutPayload;
  wsSendMessage?: ActionCreatorWithPayload<unknown>;
  onOpen: ActionCreatorWithoutPayload;
  onClose: ActionCreatorWithoutPayload;
  onError: ActionCreatorWithPayload<string>;
  onMessage: ActionCreatorWithPayload<TMessage>;
};

// Делаем функцию middleware generic
export const socketMiddleware = <TMessage = WebSocketMessage>(
  wsActions: TwsActionTypes<TMessage>
): Middleware => {
  return (store) => {
    let socket: WebSocket | null = null;
    let _isConnected = false;
    let reconnectTimer: number | null = null;
    let currentUrl: string | null = null;
    let manuallyDisconnected = false;

    const clearTimer = (): void => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const disconnectSocket = (): void => {
      clearTimer();
      if (socket) {
        socket.close(1000, 'Normal closure');
        socket = null;
      }
      _isConnected = false;
    };

    return (next) => (action) => {
      const { dispatch } = store;
      const {
        wsConnect,
        wsDisconnect,
        onOpen,
        onClose,
        onError,
        onMessage,
        wsSendMessage,
      } = wsActions;

      if (wsConnect.match(action)) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          return next(action);
        }

        if (socket && socket.readyState === WebSocket.CONNECTING) {
          return next(action);
        }

        manuallyDisconnected = false;
        currentUrl = action.payload;

        try {
          socket = new WebSocket(currentUrl);
          _isConnected = true;

          socket.onopen = (): void => {
            dispatch(onOpen());
          };

          socket.onerror = (_event: Event): void => {
            if (
              socket &&
              socket.readyState !== WebSocket.CLOSING &&
              socket.readyState !== WebSocket.CLOSED
            ) {
              dispatch(onError('WebSocket connection error'));
            }
          };

          socket.onclose = (event: CloseEvent): void => {
            dispatch(onClose());
            socket = null;
            _isConnected = false;

            if (!manuallyDisconnected && currentUrl && event.code !== 1000) {
              clearTimer();
              reconnectTimer = window.setTimeout((): void => {
                dispatch(wsConnect(currentUrl!));
              }, 3000);
            }
          };

          socket.onmessage = (event: MessageEvent): void => {
            try {
              const parsedData = JSON.parse(event.data) as TMessage;
              dispatch(onMessage(parsedData));
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              dispatch(onError(`Failed to parse message: ${errorMessage}`));
            }
          };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          dispatch(onError(`Failed to create connection: ${errorMessage}`));
        }
      }

      if (wsDisconnect.match(action)) {
        manuallyDisconnected = true;
        clearTimer();
        disconnectSocket();
        dispatch(onClose());
      }

      if (
        wsSendMessage?.match(action) &&
        socket &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send(JSON.stringify(action.payload));
      }

      return next(action);
    };
  };
};

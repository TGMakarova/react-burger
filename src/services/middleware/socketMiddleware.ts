import type { Middleware } from 'redux';
import type { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from '@reduxjs/toolkit';

export type TwsActionTypes = {
  wsConnect: ActionCreatorWithPayload<string>;
  wsDisconnect: ActionCreatorWithoutPayload;
  wsSendMessage?: ActionCreatorWithPayload<any>;
  onOpen: ActionCreatorWithoutPayload;
  onClose: ActionCreatorWithoutPayload;
  onError: ActionCreatorWithPayload<string>;
  onMessage: ActionCreatorWithPayload<any>;
};

export const socketMiddleware = (wsActions: TwsActionTypes): Middleware => {
  return (store) => {
    let socket: WebSocket | null = null;
    let isConnected = false;
    let reconnectTimer: number | null = null;
    let currentUrl: string | null = null;
    let manuallyDisconnected = false;

    const clearTimer = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const disconnectSocket = () => {
      clearTimer();
      if (socket) {
        socket.close(1000, 'Normal closure');
        socket = null;
      }
      isConnected = false;
    };

    return (next) => (action) => {
      const { dispatch } = store;
      const { wsConnect, wsDisconnect, onOpen, onClose, onError, onMessage, wsSendMessage } = wsActions;

      if (wsConnect.match(action)) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('🟢 WebSocket already connected');
          return next(action);
        }

        if (socket && socket.readyState === WebSocket.CONNECTING) {
          console.log('🟢 WebSocket is connecting...');
          return next(action);
        }

        manuallyDisconnected = false;
        currentUrl = action.payload;
        console.log('🟢 WebSocket connecting to:', currentUrl?.replace(/token=[^&]*/, 'token=HIDDEN'));

        try {
          socket = new WebSocket(currentUrl);
          isConnected = true;

          socket.onopen = () => {
            console.log('✅ WebSocket opened');
            dispatch(onOpen());
          };

          socket.onerror = (event) => {
            console.error('❌ WebSocket error:', event);
            // Не диспатчим ошибку при нормальном закрытии
            if (socket && socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
              dispatch(onError('WebSocket connection error'));
            }
          };

          socket.onclose = (event) => {
            console.log('🔴 WebSocket closed:', { code: event.code, reason: event.reason, wasClean: event.wasClean });
            
            if (event.wasClean) {
              console.log('✅ Clean closure');
            } else {
              console.log('⚠️ Abnormal closure');
            }
            
            dispatch(onClose());
            socket = null;
            isConnected = false;

            // Переподключаемся только если не было ручного отключения
            if (!manuallyDisconnected && currentUrl && event.code !== 1000) {
              console.log('🔄 Reconnecting in 3 seconds...');
              clearTimer();
              reconnectTimer = window.setTimeout(() => {
                console.log('🔄 Reconnecting...');
                dispatch(wsConnect(currentUrl!));
              }, 3000);
            }
          };

          socket.onmessage = (event) => {
            try {
              const parsedData = JSON.parse(event.data);
              console.log('📩 WebSocket message received. Orders:', parsedData.orders?.length ?? 0);
              dispatch(onMessage(parsedData));
            } catch (error) {
              console.error('❌ Failed to parse WebSocket message:', error);
            }
          };
        } catch (error) {
          console.error('❌ Failed to create WebSocket:', error);
          dispatch(onError('Failed to create connection'));
        }
      }

      if (wsDisconnect.match(action)) {
        console.log('🔴 WebSocket disconnecting (manual)');
        manuallyDisconnected = true;
        clearTimer();
        disconnectSocket();
        dispatch(onClose());
      }

      if (wsSendMessage?.match(action) && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(action.payload));
      }

      return next(action);
    };
  };
};

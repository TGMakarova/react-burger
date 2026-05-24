import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { socketMiddleware } from './socketMiddleware';
import type { UnknownAction, MiddlewareAPI } from '@reduxjs/toolkit';
import {
  wsConnect,
  wsDisconnect,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
} from '../slices/feedSlice';

const wsActions = {
  wsConnect,
  wsDisconnect,
  onOpen: wsOpen,
  onClose: wsClose,
  onError: wsError,
  onMessage: wsMessage,
};

// -------- Ручной мок WebSocket --------
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  readyState: number = WebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  send = vi.fn();
  close = vi.fn((code?: number, reason?: string) => {
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: code || 1000 }));
    }
    this.readyState = WebSocket.CLOSED;
  });
  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
  static reset() {
    MockWebSocket.instances = [];
  }
}

global.WebSocket = MockWebSocket as any;
// ------------------------------------

describe('socketMiddleware', () => {
  let mockStore: MiddlewareAPI;
  let next: ReturnType<typeof vi.fn>;
  let middleware: ReturnType<typeof socketMiddleware>;

  beforeEach(() => {
    MockWebSocket.reset();
    vi.useFakeTimers();
    next = vi.fn((action: UnknownAction) => action);
    mockStore = {
      getState: vi.fn(),
      dispatch: vi.fn(),
    } as unknown as MiddlewareAPI;
    middleware = socketMiddleware(wsActions);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates WebSocket on wsConnect and calls next', () => {
    const action = wsActions.wsConnect('ws://test.com');
    middleware(mockStore)(next)(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe('ws://test.com');
  });

  it('dispatches onOpen when socket opens', () => {
    const action = wsActions.wsConnect('ws://test.com');
    middleware(mockStore)(next)(action);
    const socket = MockWebSocket.instances[0];
    socket.onopen!(new Event('open'));
    expect(mockStore.dispatch).toHaveBeenCalledWith(wsActions.onOpen());
  });

  it('dispatches onMessage with parsed data', () => {
    const action = wsActions.wsConnect('ws://test.com');
    middleware(mockStore)(next)(action);
    const socket = MockWebSocket.instances[0];
    const testData = { type: 'ORDER', payload: { id: 1 } };
    socket.onmessage!({ data: JSON.stringify(testData) } as MessageEvent);
    expect(mockStore.dispatch).toHaveBeenCalledWith(wsActions.onMessage(testData));
  });

  it('dispatches onError on parse failure', () => {
    const action = wsActions.wsConnect('ws://test.com');
    middleware(mockStore)(next)(action);
    const socket = MockWebSocket.instances[0];
    socket.onmessage!({ data: 'invalid json' } as MessageEvent);
    // Используем частичное совпадение, так как текст ошибки может отличаться
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: wsError.type,
        payload: expect.stringContaining('Failed to parse message'),
      })
    );
  });

  it('reconnects after non-manual close', () => {
    const action = wsActions.wsConnect('ws://test.com');
    middleware(mockStore)(next)(action);
    const socket = MockWebSocket.instances[0];
    // Имитируем успешное открытие (для внутреннего состояния)
    socket.onopen!(new Event('open'));
    socket.onclose!(new CloseEvent('close', { code: 1006 }));
    expect(mockStore.dispatch).toHaveBeenCalledWith(wsActions.onClose());
    vi.advanceTimersByTime(3000);
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      wsActions.wsConnect('ws://test.com')
    );
  });
});

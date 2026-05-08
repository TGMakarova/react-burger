import { configureStore } from '@reduxjs/toolkit';

import {
  apiMiddleware,
  localStorageMiddleware,
  performanceMiddleware,
} from '../middleware/apiMiddleware';
import { socketMiddleware } from '../middleware/socketMiddleware';
import authReducer from '../slices/authSlice';
import burgerConstructorReducer from '../slices/burgerConstructorSlice';
import feedReducer, {
  wsConnect,
  wsDisconnect,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
} from '../slices/feedSlice';
import ingredientsReducer from '../slices/ingredientsSlice';
import orderReducer from '../slices/orderSlice';
import profileFeedReducer, {
  wsConnectProfile,
  wsDisconnectProfile,
  wsOpenProfile,
  wsCloseProfile,
  wsErrorProfile,
  wsMessageProfile,
} from '../slices/profileFeedSlice';
import profileOrdersReducer from '../slices/profileOrderSlice';
import selectedIngredientReducer from '../slices/selectedIngredientSlice';

// Настройка WebSocket для публичной ленты
const feedWsActions = {
  wsConnect,
  wsDisconnect,
  onOpen: wsOpen,
  onClose: wsClose,
  onError: wsError,
  onMessage: wsMessage,
};

// Настройка WebSocket для личных заказов
const profileFeedWsActions = {
  wsConnect: wsConnectProfile,
  wsDisconnect: wsDisconnectProfile,
  onOpen: wsOpenProfile,
  onClose: wsCloseProfile,
  onError: wsErrorProfile,
  onMessage: wsMessageProfile,
};

const feedMiddleware = socketMiddleware(feedWsActions);
const profileFeedMiddleware = socketMiddleware(profileFeedWsActions);

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    burgerConstructor: burgerConstructorReducer,
    selectedIngredient: selectedIngredientReducer,
    order: orderReducer,
    auth: authReducer,
    feed: feedReducer,
    profileFeed: profileFeedReducer,
    profileOrders: profileOrdersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['burgerConstructor/addIngredient'],
      },
    })
      .concat(apiMiddleware)
      .concat(localStorageMiddleware)
      .concat(performanceMiddleware)
      .concat(feedMiddleware)
      .concat(profileFeedMiddleware),

  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

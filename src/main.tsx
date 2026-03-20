import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactDom from 'react-dom/client'
import { Provider } from 'react-redux';
import { App } from '@components/app/app';
import { store } from './services/store';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store ={store}>
      <App />
      </Provider>
  </StrictMode>
);

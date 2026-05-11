import {
  useDispatch as useOriginalDispatch,
  useSelector as useOriginalSelector,
} from 'react-redux';

import type { AppDispatch, RootState } from '../services/store';

// Кастомный хук useDispatch
export const useDispatch = (): AppDispatch => useOriginalDispatch();

// Кастомный типизированный хук useSelector
export const useSelector = <T>(selector: (state: RootState) => T): T =>
  useOriginalSelector(selector);

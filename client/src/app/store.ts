import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer from '@/features/auth/authSlice';
import { errorMiddleware } from './errorMiddleware';
import { authCacheMiddleware } from './authCacheMiddleware';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, errorMiddleware, authCacheMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

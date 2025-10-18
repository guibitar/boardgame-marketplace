import { configureStore } from '@reduxjs/toolkit'
// import authReducer from './slices/authSlice'
// import collectionReducer from './slices/collectionSlice'
// import saleListReducer from './slices/saleListSlice'

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // collection: collectionReducer,
    // saleList: saleListReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


import { configureStore } from '@reduxjs/toolkit'
import { publicApi } from '../api/publicApi'

export const store = configureStore({
  reducer: { [publicApi.reducerPath]: publicApi.reducer },
  middleware: (getDefault) => getDefault().concat(publicApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>

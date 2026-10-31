import { configureStore } from '@reduxjs/toolkit'
import { adminApi } from '../api/adminApi'

/** Separate store for the admin chunk, so admin code never enters the public bundle. */
export const adminStore = configureStore({
  reducer: { [adminApi.reducerPath]: adminApi.reducer },
  middleware: (getDefault) => getDefault().concat(adminApi.middleware),
})

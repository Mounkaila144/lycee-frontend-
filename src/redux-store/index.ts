// Third-party Imports
import { configureStore, createSlice } from '@reduxjs/toolkit'

// Placeholder slice to ensure store has valid reducer
const appSlice = createSlice({
  name: 'app',
  initialState: {
    initialized: true,
  },
  reducers: {},
})

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

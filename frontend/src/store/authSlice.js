import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    auth: localStorage.getItem('auth'),
  },
  reducers: {
    login: (state, action) => {
      state.auth = JSON.stringify(action.payload);
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.auth = null;
      localStorage.removeItem('auth');
    },
  },
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer
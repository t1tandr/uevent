import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    auth: localStorage.getItem('auth') ? true : false,
  },
  reducers: {
    login: (state, action) => {
      state.auth = true;
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.auth = false;
      localStorage.removeItem('auth');
    },
  },
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer
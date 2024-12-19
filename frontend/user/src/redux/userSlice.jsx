// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.user = action.payload;
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { addUser, updateAccessToken, logoutUser } = userSlice.actions;
export default userSlice.reducer;

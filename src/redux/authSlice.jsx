import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(payload.user));
      localStorage.setItem("token", payload.token);
      localStorage.setItem("tokenTimestamp", Date.now()); // Store timestamp
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenTimestamp");
    },
    checkTokenExpiry: (state) => {
      const tokenTimestamp = localStorage.getItem("tokenTimestamp");
      const isExpired =
        tokenTimestamp && Date.now() - tokenTimestamp > 24 * 60 * 60 * 1000; // 24 hours
      if (isExpired) {
        authSlice.caseReducers.logOut(state); // Expire token
      }
    },
  },
});

export const { setCredentials, logOut, checkTokenExpiry } = authSlice.actions;
export default authSlice.reducer;

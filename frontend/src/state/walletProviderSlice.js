import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provider: null,
};

const walletProviderSlice = createSlice({
  name: "walletProvider",
  initialState,
  reducers: {
    setWalletProvider(state, action) {
      state.provider = action.payload;
    },
  },
});

export const { setWalletProvider } = walletProviderSlice.actions;

export default walletProviderSlice.reducer;

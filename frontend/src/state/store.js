import { configureStore } from "@reduxjs/toolkit";
import walletProviderReducer from "./walletProviderSlice";

export const store = configureStore({
  reducer: {
    walletProvider: walletProviderReducer,
  },
});

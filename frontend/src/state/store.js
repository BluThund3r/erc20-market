import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import userDetailsReducer from "./userDetailsSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "main-root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, userDetailsReducer);

export const store = configureStore(
  {
    reducer: {
      userDetails: persistedReducer,
    },
  },
  applyMiddleware()
);

export const Persistor = persistStore(store);

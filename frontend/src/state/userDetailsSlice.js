import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  address: "",
};

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    setUserAddress(state, action) {
      state.address = action.payload.address;
    },
  },
});

export const { setUserAddress } = userDetailsSlice.actions;

export default userDetailsSlice.reducer;

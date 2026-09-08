import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    myShopData: null,
  },
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = action.payload;
    },
  },
});

export const { setMyShopData } = adminSlice.actions;
export default adminSlice.reducer;

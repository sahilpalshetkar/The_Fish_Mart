import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
  },
  reducers: {
    addMyOrder: (state, action) => {
      state.myOrders = [...state.myOrders, action.payload];
    },
  },
});

export const { addMyOrder } = orderSlice.actions;
export default orderSlice.reducer;

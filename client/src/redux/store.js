import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import adminSlice from "./adminSlice";
import mapSlice from "./mapSlice";
import orderSlice from "./orderSlice";
import cartSlice from "./cartSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    admin: adminSlice,
    map: mapSlice,
    order: orderSlice,
    cart: cartSlice,
  },
});

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    /*  SET CART FROM BACKEND */
    setCart: (state, action) => {
      const cart = action.payload;

      state.cartItems = (cart?.items || [])
        .map((item) => ({
          ...item,

          // MongoDB subdocument ID
          cartItemId: item._id,

          // Keep only Item ID in Redux
          item: typeof item.item === "object" ? item.item._id : item.item,

          // Normalize variant names for frontend
          variant: {
            size: item.variant?.size || "",
            weight: Number(item.variant?.weight || 0),
            weightUnit: item.variant?.weightUnit || "",
            cleaningInstruction: item.variant?.cleaningInstruction || "",
          },

          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        }))
        .sort((a, b) => {
          // Newest cart item first
          return b.cartItemId.localeCompare(a.cartItemId);
        });

      state.totalAmount = Number(
        cart?.totalAmount ||
          state.cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
          ),
      );
    },

    /*  CLEAR CART */
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
  },
});

export const { setCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;

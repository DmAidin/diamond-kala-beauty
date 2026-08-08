import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // { id, title, price, quantity, image }
  totalQuantity: 0,
  totalPrice: 0,
  ownerId: null, // the user id this cart currently belongs to (null = guest)
};

const recalc = (state) => {
  state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);
  state.totalPrice = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const id = item._id || item.id;
      const existingItem = state.items.find((i) => i.id === id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          id,
          title: item.name || item.title,
          price: item.price,
          image: item.image || item.images?.[0],
          quantity: 1,
        });
      }
      recalc(state);
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      recalc(state);
    },

    increaseQuantity(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
      recalc(state);
    },

    decreaseQuantity(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter((i) => i.id !== action.payload);
      }
      recalc(state);
    },

    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },

    // Called whenever the signed-in user changes (login/logout/switch account).
    // If the cart belonged to a different owner than the incoming session,
    // it's wiped so one account never sees another account's basket.
    setCartOwner(state, action) {
      const newOwnerId = action.payload; // string userId or null for guest
      if (state.ownerId !== newOwnerId) {
        state.items = [];
        state.totalQuantity = 0;
        state.totalPrice = 0;
        state.ownerId = newOwnerId;
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCartOwner,
} = cartSlice.actions;

export default cartSlice.reducer;

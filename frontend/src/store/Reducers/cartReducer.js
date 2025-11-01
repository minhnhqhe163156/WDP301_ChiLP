const initialState = { items: [] };
export const CLEAR_CART = "CLEAR_CART";
export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case CLEAR_CART:
      return { ...state, items: [] };
    default:
      return state;
  }
}
export const clearCart = () => ({ type: CLEAR_CART }); 
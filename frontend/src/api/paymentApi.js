import api from "./api";

export const createOrder = async ({
  user_id,
  paymentMethod,
  shipping_address,
  items,
}) => {
  return api.post("/orders", {
    user_id,
    paymentMethod,
    shipping_address,
    items,
  });
};



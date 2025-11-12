import { io } from "socket.io-client";

export const createSocket = (token) => {
  return io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
  });
}; 
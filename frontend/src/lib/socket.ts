import { io, type Socket } from "socket.io-client";

const socketBackendURL = "http://localhost:9000";

const globalSocket = globalThis as typeof globalThis & {
  __taskChatSocket?: Socket;
};

export const socket =
  globalSocket.__taskChatSocket ??
  io(socketBackendURL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

globalSocket.__taskChatSocket = socket;

export default socket;

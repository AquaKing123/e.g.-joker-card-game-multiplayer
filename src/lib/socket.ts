import { io as socketIo } from "socket.io-client";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (url: string): Socket => {
  if (!socket) {
    socket = socketIo(url, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event: string, data: any): void => {
  if (socket) {
    socket.emit(event, data);
  } else {
    console.error("Socket not initialized");
  }
};

export const onEvent = (
  event: string,
  callback: (...args: any[]) => void,
): void => {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.error("Socket not initialized");
  }
};

export const offEvent = (
  event: string,
  callback?: (...args: any[]) => void,
): void => {
  if (socket) {
    socket.off(event, callback);
  }
};

import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    user: {
      id: string;
    }; // or a more specific type if you have one
  }
}

import { Socket } from "socket.io";
export declare const sendMessageHandler: (socket: Socket, message: Message, chat: Chat) => Promise<void>;

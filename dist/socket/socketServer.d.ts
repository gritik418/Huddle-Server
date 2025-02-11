import http from "http";
import { Socket } from "socket.io";
import EventEmitter from "events";
export declare const SocketEventEmitter: EventEmitter<[never]>;
export declare const ConnectedUsers: Map<string, Socket<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>>;
declare const socketServer: (httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => void;
export default socketServer;

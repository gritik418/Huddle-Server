import http from "http";
import EventEmitter from "events";
export declare const SocketEventEmitter: EventEmitter<[never]>;
export declare const ConnectedUsers: Map<string, string>;
declare const socketServer: (httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => void;
export default socketServer;

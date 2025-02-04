import http from "http";
declare const socketServer: (httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => void;
export default socketServer;

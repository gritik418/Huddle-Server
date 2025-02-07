import { Request, Response } from "express";
export declare const searchUsers: (req: Request, res: Response) => Promise<Response>;
export declare const getChatRequests: (req: Request, res: Response) => Promise<Response>;
export declare const sendChatRequest: (req: Request, res: Response) => Promise<Response>;
export declare const acceptChatRequest: (req: Request, res: Response) => Promise<Response>;
export declare const declineChatRequest: (req: Request, res: Response) => Promise<Response>;

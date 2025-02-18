import { Request, Response } from "express";
export declare const getFollowRequests: (req: Request, res: Response) => Promise<Response>;
export declare const sendFollowRequest: (req: Request, res: Response) => Promise<Response>;
export declare const acceptFollowRequest: (req: Request, res: Response) => Promise<Response>;

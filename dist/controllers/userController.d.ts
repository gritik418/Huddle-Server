import { Request, Response } from "express";
export declare const getUser: (req: Request, res: Response) => Promise<Response>;
export declare const getFollowing: (req: Request, res: Response) => Promise<Response>;
export declare const getFollowers: (req: Request, res: Response) => Promise<Response>;
export declare const getActiveMembers: (req: Request, res: Response) => Promise<Response>;

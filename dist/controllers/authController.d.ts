import { Request, Response } from "express";
export declare const userSignup: (req: Request, res: Response) => Promise<Response>;
export declare const userLogin: (req: Request, res: Response) => Promise<Response>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<Response>;
export declare const userLogout: (req: Request, res: Response) => Promise<Response>;

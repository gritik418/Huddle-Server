import { Request, Response } from "express";
export declare const addPost: (req: Request, res: Response) => Promise<Response>;
export declare const getPosts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPostById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPostsByFollowing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getFeed: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;

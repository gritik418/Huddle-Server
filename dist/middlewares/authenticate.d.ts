import { NextFunction, Request, Response } from "express";
declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;
export default authenticate;

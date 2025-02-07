import { NextFunction, Request, Response } from "express";
import { HUDDLE_TOKEN } from "../constants/variables";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.cookies[HUDDLE_TOKEN];
    console.log(token);

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export default authenticate;

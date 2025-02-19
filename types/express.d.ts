declare global {
  namespace Express {
    export interface Request {
      files: object;
    }
  }
}

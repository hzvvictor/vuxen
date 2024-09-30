import { NextFunction, Request, Response } from "express";

const useErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'SequelizeValidationError') {
    const errObj = {};
    error.errors.map((er: { path: string; message: string }) => {
      (errObj as any)[er.path] = er.message;
    });
    return res.status(400).json({
      message: 'Validation error',
      error: errObj
    });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: error.message,
      error: error.parent.detail
    });
  }
  if (error.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      message: error.message
    });
  }
  console.log(`> Error: ${error.message}`, error);
  return res.status(500).json({
    message: error.message,
    error: error
  });
}

export default useErrorHandler;
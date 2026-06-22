import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { registerUser, loginUser, getUserById } from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  sendSuccess(res, result, 200);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.id);
  sendSuccess(res, user, 200);
});

import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { registerSchema, loginSchema } from '../../schemas/auth.schema';
import { register, login, me } from './auth.controller';

const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.get('/me', auth, me);

export default authRouter;

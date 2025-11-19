import { Request, Response } from 'express';
import { login } from '../../Services/auth.service';

class AuthController {
  static async postLogin(req: Request, res: Response) {
    try {
      const result = await login(req.body);
      res.status(200).json(result);
    } catch (error) {
      const err = error as { statusCode?: number; message?: string };
      res
        .status(err.statusCode ?? 500)
        .json({ message: err.message ?? 'An unexpected error occurred' });
    }
  }

  static postLogout(req: Request, res: Response) {
    res
      .status(200)
      .json({ message: 'Logged out (frontend should clear token)' });
  }
}

export default AuthController;

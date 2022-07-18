import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { CreateUserDto } from '@dtos/users.dto';
// import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ data: omit(signUpUserData, 'password'), message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const { token, findUser } = await this.authService.login(userData);

      res.status(200).json({
        data: {
          token,
          user: omit(findUser, 'password'),
        },
        message: 'login',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;

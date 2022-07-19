import { Request } from 'express';
import { User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  query: any;
  cookies: any;
  headers: any;
  file: any;
  user: User;
}

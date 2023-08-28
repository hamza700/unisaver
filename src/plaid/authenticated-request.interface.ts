import { Request } from 'express';
import { User } from '../auth/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}

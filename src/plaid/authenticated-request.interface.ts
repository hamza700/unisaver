import { Request } from 'express';
import { User } from 'src/auth/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}

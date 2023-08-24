import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedRequest } from 'src/plaid/authenticated-request.interface';

@Injectable()
export class VerifiedGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    console.log('User:', user); // Log user object

    if (user && user.isVerified) {
      return true;
    }

    return false;
  }
}

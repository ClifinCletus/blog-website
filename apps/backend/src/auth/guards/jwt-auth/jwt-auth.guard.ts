import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //the jwt validation (token) is tied to the req, but graphql doesnt directly use it. hence we write this fn getRequest fn for that.
  //hence now it gets the token using the guard and verify it by passing to the jwtstrategy(jwt)
  getRequest(context: ExecutionContext) {
    //here we are converting the standard execution context ot graphql execution context
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req; //extracting the request now from the graphql execution context
  }
}

import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './entities/auth-payload.entity';
import { SiginInInput } from './dto/signin.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * ======================================================
   * ✅ signIn Mutation
   * ======================================================
   * - Purpose: Handle user login from GraphQL API.
   * - Process:
   *   1. Take "signInInput" (email + password).
   *   2. Call AuthService.validateLocalUser to check credentials.
   *   3. If valid → call AuthService.login to get JWT + user info.
   *   4. Return that info to the client.
   * - Why done in Resolver? Because in GraphQL, queries & mutations
   *   are the entry points for client requests.
   */
  //here we used multiple services to perform an operation
  @Mutation(() => AuthPayload) //as in the mutation or query, we may provide the return type, hence we created a entity for the reutrn type(here we returns user info and access token from the login service)
  async signIn(@Args('signInInput') siginInInput: SiginInInput) {
    // Step 1: Validate user credentials
    const user = await this.authService.validateLocalUser(siginInInput);

    // Step 2: Call login to generate JWT + return user info
    return await this.authService.login(user);
  }
}

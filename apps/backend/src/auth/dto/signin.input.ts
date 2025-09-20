import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SiginInInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

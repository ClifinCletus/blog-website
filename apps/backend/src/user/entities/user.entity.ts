import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CommentEntity } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity'; //

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;

  //this, here have the posts(the real posts), so we need to give the data Post from the src/post/entity... ie, the post entitiy we defined on the post module
  @Field(() => [Post]) //field type array of Post
  posts?: Post[]; //posts pf type having array of posts

  //same as above
  @Field(() => [CommentEntity])
  comments: CommentEntity[];
}

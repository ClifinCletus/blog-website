// Import decorators and scalar types from @nestjs/graphql
// - @ObjectType → used to define a GraphQL "type" (like schema definition for objects).
// - @Field → marks a property as a GraphQL field so it can appear in queries/mutations.
// - Int → GraphQL's Integer type (32-bit signed int).
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CommentEntity } from 'src/comment/entities/comment.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';

// 👇 This decorator marks the class as a GraphQL "ObjectType".
// In GraphQL schema, this will generate something like:
//
// type Post {
//   id: Int!
//   title: String!
//   thumbnail: String
//   content: String!
//   published: Boolean!
//   createdAt: Date!
//   updatedAt: Date!
//   author: User!
//   tags: [Tag!]!
//   comments: [CommentEntity!]!

// }
@ObjectType()
export class Post {
  // 👇 Field decorator makes this property visible in GraphQL schema.
  // Here `Int` is used so GraphQL knows this is an integer.
  // `id` will be required (non-nullable) in schema. string is the default type, hence no need to add it on type(in callback)
  @Field(() => Int)
  id: number;

  // 👇 A simple required string field for the post title.
  @Field()
  title: string;

  // 👇 "nullable: true" means this field is optional.
  // In the schema it will be `thumbnail: String` (can be null).
  @Field({ nullable: true })
  thumbnail?: string;

  @Field()
  content: string;

  //type boolean
  @Field(() => Boolean)
  published: boolean;

  // 👇 A Date field for when the post was created.
  // By default, NestJS GraphQL maps `Date` to `DateTime` scalar.(considers as a string)
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // 👇 A relation field pointing to another ObjectType called "User".
  // This means each Post has exactly **one author** (non-nullable).
  // In GraphQL schema this becomes:
  //   author: User!
  //
  // Example:
  // {
  //   author {
  //     id
  //     name
  //   }
  // }
  @Field(() => User)
  author: User; //take from the src/user/entities/user.entity (means from the one with the @ObjectType(), not the prisma defined type)

  // 👇 A list of tags associated with the post.
  // - [Tag] means it's an array of Tag objects.
  // - By default, both the array and its items are **non-nullable**.
  // In GraphQL schema:
  //   tags: [Tag!]! → means array is non-null, and each Tag item is also non-null.
  //
  @Field(() => [Tag])
  tags: Tag[];

  //like above
  // Schema → comments: [CommentEntity!]!
  @Field(() => [CommentEntity])
  comments: CommentEntity[];
}

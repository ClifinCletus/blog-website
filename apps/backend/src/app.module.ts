import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';
import { TagModule } from './tag/tag.module';
import { LikeModule } from './like/like.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,

    // 👇 Adding GraphQL support to the NestJS app
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // 🚀 Driver tells NestJS which GraphQL server to use
      driver: ApolloDriver,

      // ⚡ autoSchemaFile: add this when  doing as code-first approach (this would create the schemafirst type schema from the code-first approach)
      // Instead of manually writing GraphQL schema (.gql or .graphql file),
      // NestJS will automatically generate it based on your TypeScript resolvers
      // and save it at the given path.
      // This makes schema management easier for beginners.
      autoSchemaFile: join(process.cwd(), 'src/grapghql/schema.gql'), //this is the path for where to save the resolvers,schema etc.

      //for telling the path where to place the schema, mutations,query etc
      // Note: process.cwd() → returns your project’s root directory
      // so schema will be created at: <project-root>/src/grapghql.schema/gql
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PostModule,

    UserModule,

    CommentModule,

    TagModule,

    LikeModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

/**
 * =========================
 * 📌 GRAPHQL BASICS
 * =========================
 * - GraphQL is a query language for APIs (like SQL for databases, but for APIs).
 * - Instead of REST (multiple endpoints like /users, /posts, etc.),
 *   GraphQL gives you ONE endpoint (`/graphql`) where the client can ask
 *   for exactly the data it needs.
 *
 * Example difference:
 *   REST → GET /users/1 returns a full user object (even if you only need "name").
 *   GraphQL → query { user(id: 1) { name } } returns ONLY the name field.
 *
 * ✅ Why use GraphQL?
 * - No overfetching/underfetching (clients get exactly what they need).
 * - Strongly typed schema → acts like a contract between frontend & backend.
 * - Easier integration with frontend frameworks (React, Next.js, etc.).
 *
 * --------------------------
 * 🛠️ Core Concepts:
 * --------------------------
 * 1) Schema → defines "what data is available".
 *    Example:
 *      type User {
 *        id: Int!
 *        name: String!
 *        email: String!
 *      }
 *
 * 2) Query → read operations (like GET in REST).
 *    Example:
 *      query {
 *        users {
 *          id
 *          name
 *        }
 *      }
 *
 * 3) Mutation → write operations (like POST/PUT/DELETE in REST).
 *    Example:
 *      mutation {
 *        createUser(name: "Alice", email: "a@a.com") {
 *          id
 *          name
 *        }
 *      }
 *
 * 4) Resolver → functions in your backend that actually fetch or update data.
 *    Example:
 *      Query.users → calls Prisma to fetch all users from DB.
 *      Mutation.createUser → calls Prisma to insert a new user in DB.
 *
 * 5) Prisma with GraphQL:
 *    - Prisma handles the database (Postgres, MySQL, SQLite, etc.)
 *    - GraphQL acts as a query layer → clients request → resolvers → Prisma → DB.
 *
 * --------------------------
 * 🔄 Flow Example:
 * --------------------------
 *   Client → Query { users { id name } }
 *   ↓
 *   GraphQL Resolver (users)
 *   ↓
 *   Prisma.user.findMany()
 *   ↓
 *   Database (returns rows)
 *   ↓
 *   GraphQL sends result back to client
 */

/* --------------------------
 * ⚖️ Entities in GraphQL (Code-First NestJS)
 * --------------------------
 * 1) What is an Entity?
 *    - An "Entity" in GraphQL is just a TypeScript class that represents
 *      a data model in your API (similar to a table in DB or a DTO in REST).
 *    - In Code-First, entities are decorated with `@ObjectType()` and fields
 *      are marked with `@Field()`.
 *
 * 2) Example:
 *    @ObjectType()  // tells NestJS: this is a GraphQL type
 *    class User {
 *      @Field() id: number;        // exposed to GraphQL schema
 *      @Field() name: string;
 *      @Field() email: string;
 *    }
 *
 *    // Auto-generated schema from above:
 *    type User {
 *      id: Int!
 *      name: String!
 *      email: String!
 *    }
 *
 * 3) Use of Entities:
 *    - Define the structure of the data exposed to the GraphQL API.
 *    - Ensure type safety (TS checks match schema).
 *    - Work as a "bridge" between Prisma models (DB) and GraphQL schema.
 *
 * 4) Relation to Prisma:
 *    - Prisma models live in `schema.prisma` (DB layer).
 *    - GraphQL entities live in `*.entity.ts` files (API layer).
 *    - Example:
 *        Prisma model → model User { id Int, name String, email String }
 *        GraphQL entity → @ObjectType() class User { @Field() id: number; ... }
 *
 * 🚩 Important:
 * - Entities define what the **API exposes** (may not always be same as DB).
 *   For example, you can hide "password" in GraphQL even though it exists in DB.
 *
 *
 * --------------------------
 * 📌 DTOs in GraphQL — Do we need them?
 * --------------------------
 * - In REST (with controllers), DTOs are **separate classes** used to:
 *    ✅ Validate input (e.g., class-validator)
 *    ✅ Define request/response shapes
 *
 * - In GraphQL Code-First:
 *    🔹 Entities (`@ObjectType()`) → describe the **output type** (what API returns).
 *    🔹 DTOs (`@InputType()`) → describe the **input type** (what API accepts).
 *
 * Example:
 *    // ENTITY (output)
 *    @ObjectType()
 *    class User {
 *      @Field() id: number;
 *      @Field() name: string;
 *      @Field() email: string;
 *    }
 *
 *    // DTO (input)
 *    @InputType()
 *    class CreateUserInput {
 *      @Field() name: string;
 *      @Field() email: string;
 *      @Field() password: string; // accepted in input, but not exposed in output
 *    }
 *
 * 🚩 So YES, you still use "DTO-like classes" in GraphQL,
 * but instead of @IsString() etc., you decorate them with @InputType() and @Field().
 *
 * --------------------------
 * ⚖️ Difference Summary:
 * --------------------------
 * - REST:
 *    • DTO → input/output contracts
 *    • Entity → ORM model (like Prisma/TypeORM entity)
 *
 * - GraphQL Code-First:
 *    • @ObjectType() → defines output entity (API response).
 *    • @InputType() → works like DTO (API input).
 *    • Prisma Model → database schema (separate from API schema).
 *
 * TL;DR: You don’t throw away DTOs, you replace them with GraphQL InputTypes.
 */

/* --------------------------
 * ⚖️ Code-First vs Schema-First Approaches
 * --------------------------
 * NestJS GraphQL supports two main approaches:
 *
 * 1) Schema-First:
 *    - You manually write your schema in a `.graphql` file.
 *    - Example (schema.graphql):
 *        type User {
 *          id: Int!
 *          name: String!
 *        }
 *        type Query {
 *          users: [User!]!
 *        }
 *    - Then you implement resolvers in TypeScript that match the schema.
 *    - ✅ Advantage: Schema is explicit, good for teams already familiar with GraphQL.
 *    - ❌ Downside: Duplicated work (maintain schema + TypeScript types separately).
 *
 * 2) Code-First (👉 the one we use here):
 *    - You write TypeScript classes and decorate them with GraphQL decorators.
 *    - Example:
 *        @ObjectType()
 *        class User {
 *          @Field() id: number;
 *          @Field() name: string;
 *        }
 *        @Resolver(() => User)
 *        class UserResolver {
 *          @Query(() => [User]) users() { return this.prisma.user.findMany(); }
 *        }
 *    - NestJS automatically generates the `schema.gql` file for you
 *      (thanks to `autoSchemaFile` in config).
 *    - ✅ Advantage: Type safety, less duplication, great with TypeScript + Prisma.
 *    - ❌ Downside: Schema file is generated (not handwritten),
 *      so frontend teams who want to start with schema-first may find it indirect.
 *
 * --------------------------
 * 🚩 Summary:
 * - Schema-First → "Schema is the source of truth"
 * - Code-First → "Code (decorated TypeScript classes) is the source of truth"
 */

/*
 * --------------------------
 * ⚖️ Resolver vs Controller in NestJS
 * --------------------------
 * 1) Controller → used in REST API.
 *    - Each method maps to an HTTP route (GET /users, POST /users).
 *    - Example:
 *        @Controller('users')
 *        export class UserController {
 *          @Get() findAll() { return this.userService.findAll(); }
 *          @Post() create(@Body() dto) { return this.userService.create(dto); }
 *        }
 *
 * 2) Resolver → used in GraphQL API.
 *    - Each method maps to a GraphQL operation (Query or Mutation).
 *    - Example:
 *        @Resolver(() => User)
 *        export class UserResolver {
 *          @Query(() => [User]) users() { return this.userService.findAll(); }
 *          @Mutation(() => User) createUser(@Args('dto') dto) { return this.userService.create(dto); }
 *        }
 *
 * 🚩 Key Difference:
 * - Controller → bound to HTTP methods + routes (GET, POST, PUT, DELETE).
 * - Resolver → bound to GraphQL schema fields (Query, Mutation, Subscription).
 *
 * ✅ Same service logic (Prisma queries etc.) can be reused by both!
 *   - Controller just exposes it via REST.
 *   - Resolver exposes it via GraphQL.
 */

/**
 * ⚡ How schema generation works:
 * - You create "entities" (TypeScript classes decorated with @ObjectType, @Field).
 *   Example:
 *     @ObjectType()
 *     class User {
 *       @Field() id: number;
 *       @Field() name: string;
 *     }
 *
 * - You create "resolvers" (classes with @Query, @Mutation).
 *   Example:
 *     @Resolver(() => User)
 *     class UserResolver {
 *       constructor(private prisma: PrismaService) {}
 *
 *       @Query(() => [User])
 *       async users() {
 *         return this.prisma.user.findMany();
 *       }
 *
 *       @Mutation(() => User)
 *       async createUser(@Args('name') name: string, @Args('email') email: string) {
 *         return this.prisma.user.create({ data: { name, email } });
 *       }
 *     }
 *
 * - From these classes, NestJS will automatically generate:
 *     type User { id: Int!, name: String!, email: String! }
 *     type Query { users: [User]! }
 *     type Mutation { createUser(name: String!, email: String!): User! }
 */

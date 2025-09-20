// import { hash } from 'argon2';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title: string): string {
  //to create slug
  return title
    .toLowerCase()
    .trim()
    .replace(/ /g, '-') // remove empty before and after spaces (Replace spaces with hyphens)
    .replace(/[^\w-]+/g, ''); // Remove all non-word characters
}

// we use faker library to create dummy data to be used(seeding il to add to db)
//faker.entityname.fn -> syntax of faker (fn for  getting particular data as here)

async function main() {
  //   const defaultPassword = await hash('123');
  const users = Array.from({ length: 10 }).map(() => ({
    //creating 10 dummy users. also adds the id from 1 to 10 for these users.
    name: faker.person.fullName(),
    email: faker.internet.email(),
    bio: faker.lorem.sentence(),
    avatar: faker.image.avatar(),
    // password: defaultPassword,
  }));

  await prisma.user.createMany({
    data: users,
  });

  const posts = Array.from({ length: 40 }).map(() => ({
    //creating 40 posts
    title: faker.lorem.sentence(),
    slug: generateSlug(faker.lorem.sentence()),
    content: faker.lorem.paragraphs(3),
    thumbnail: faker.image.urlLoremFlickr({ height: 240, width: 320 }),
    authorId: faker.number.int({ min: 1, max: 10 }), //as now the users have the id of 1 to 10, then here we are setting the authorid  as a random number btw 1 and 10.
    published: true,
  }));

  await Promise.all(
    //inserting the post: also adding the comments to the posts
    posts.map(
      async (post) =>
        await prisma.post.create({
          data: {
            ...post,
            comments: {
              createMany: {
                data: Array.from({ length: 20 }).map(() => ({
                  content: faker.lorem.sentence(),
                  authorId: faker.number.int({ min: 1, max: 10 }),
                })),
              },
            },
          },
        }),
    ),
  );

  console.log('Seeding Completed!');
}

//executing seeding
main()
  .then(() => {
    //if done properly, disconnect
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    //else disconnect and throw error
    prisma.$disconnect();
    console.error(e);
    process.exit(1);
  });

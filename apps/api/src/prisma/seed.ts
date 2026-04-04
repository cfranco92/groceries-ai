import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Fruits & Vegetables', icon: '🥦', sortOrder: 1 },
  { name: 'Dairy', icon: '🥛', sortOrder: 2 },
  { name: 'Meat & Fish', icon: '🥩', sortOrder: 3 },
  { name: 'Bakery', icon: '🍞', sortOrder: 4 },
  { name: 'Beverages', icon: '🥤', sortOrder: 5 },
  { name: 'Snacks', icon: '🍿', sortOrder: 6 },
  { name: 'Cleaning', icon: '🧹', sortOrder: 7 },
  { name: 'Personal Care', icon: '🧴', sortOrder: 8 },
  { name: 'Frozen', icon: '🧊', sortOrder: 9 },
  { name: 'Canned Goods', icon: '🥫', sortOrder: 10 },
  { name: 'Grains & Pasta', icon: '🍝', sortOrder: 11 },
  { name: 'Condiments', icon: '🧂', sortOrder: 12 },
  { name: 'Other', icon: '📦', sortOrder: 13 },
];

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding categories...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { icon: category.icon, sortOrder: category.sortOrder },
      create: category,
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

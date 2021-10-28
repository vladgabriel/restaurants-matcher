const { PrismaClient } = require('@prisma/client');
const csvParse = require('csv-parse/lib/sync');
const { readFileSync } = require('fs');
const { resolve } = require('path');

const prisma = new PrismaClient();

async function main() {
  await prisma.restaurantMatches.deleteMany();
  await prisma.googleRestaurants.deleteMany();
  await prisma.yelpRestaurants.deleteMany();

  const googleCsv = readFileSync(resolve(__dirname, '../datasource/google.csv'));
  const googleRestaurants = csvParse(googleCsv, { columns: true });
  await prisma.googleRestaurants.createMany({
    data: googleRestaurants.map(({ name, phone, latitude, longitude }) => ({
      name: name.trim(),
      phone: phone.trim(),
      latitude: latitude.trim() ? parseFloat(latitude) : null,
      longitude: longitude.trim() ? parseFloat(longitude) : null,
    })),
  });

  const yelpCsv = readFileSync(resolve(__dirname, '../datasource/yelp.csv'));
  const yelpRestaurants = csvParse(yelpCsv, { columns: true });
  await prisma.yelpRestaurants.createMany({
    data: yelpRestaurants.map(({ name, phone, latitude, longitude }) => ({
      name: name.trim(),
      phone: phone.trim(),
      latitude: latitude.trim() ? parseFloat(latitude) : null,
      longitude: longitude.trim() ? parseFloat(longitude) : null,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

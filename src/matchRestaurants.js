require('dotenv').config({});
const { PrismaClient } = require('@prisma/client');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

/**
 * algorithm: https://en.wikipedia.org/wiki/Haversine_formula
 * stackoverflow: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
 */
const distanceBetweenCoordinates = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const PHONE_MATCH_THRESHOLD = 0.8;
const isPhoneMatch = (phoneA, phoneB) => {
  if (
    stringSimilarity.compareTwoStrings(phoneA.replaceAll(' ', ''), phoneB.replaceAll(' ', '')) > PHONE_MATCH_THRESHOLD
  ) {
    return true;
  }

  return false;
};

/**
 * Highest
 * - phoneMatch(similarity > 0.8)
 * - geoMatch(distance < 1) & nameMatch(similarity > 0.4)
 * High
 * - geoMatch(distance >= 1 && distance < 5) & nameMatch(similarity > 0.4) && we encounter only one match
 * Medium
 * - geoMatch(distance >= 1 && distance < 5) & nameMatch(similarity > 0.4) && we encounter several restaurants in the same area
 */
const matchRestaurant = (a, b) => {
  // if we match phone number, we know for sure that the locations match
  if (a.phone && b.phone && isPhoneMatch(a.phone, b.phone)) {
    return 'Highest';
  }

  const nameSimilarity = stringSimilarity.compareTwoStrings(a.name, b.name);
  let distance = null;
  if (a.latitude && a.longitude && b.latitude && b.longitude) {
    distance = distanceBetweenCoordinates(a.latitude, a.longitude, b.latitude, b.longitude);
  }

  if (distance && distance < 1 && nameSimilarity > 0.4) {
    return 'Highest';
  }

  if (distance && distance >= 1 && distance < 5 && nameSimilarity > 0.4) {
    return 'High';
  }

  return null;
};

const storeMatch = (googleRestaurantId, yelpRestaurantId, certainty) => {
  return prisma.restaurantMatches.create({
    data: {
      googleRestaurantId,
      yelpRestaurantId,
      certainty,
    },
  });
};

async function main() {
  const googleRestaurants = await prisma.googleRestaurants.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  const yelpRestaurants = await prisma.yelpRestaurants.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  for (let googleR of googleRestaurants) {
    let highMatches = [];
    for (let yelpR of yelpRestaurants) {
      const match = matchRestaurant(googleR, yelpR);
      // if we match Highest we don't look for any other matches for this google restaurant
      if (match === 'Highest') {
        await storeMatch(googleR.id, yelpR.id, 'Highest');
        highMatches = [];
        break;
      }
      // store all High matches
      if (match === 'High') {
        highMatches.push(yelpR.id);
      }
    }
    // if only one High match we good
    if (highMatches.length === 1) {
      await storeMatch(googleR.id, highMatches[0], 'High');
    }

    // if we have multiple high matches, the there are multiple restaurants in the same area and we don't know for sure
    if (highMatches.length > 1) {
      for (let yelpId of highMatches) {
        await storeMatch(googleR.id, yelpId, 'Medium');
      }
    }

    highMatches = [];
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

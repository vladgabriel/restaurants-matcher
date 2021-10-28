-- CreateEnum
CREATE TYPE "Certainty" AS ENUM ('Highest', 'High', 'Medium');

-- CreateTable
CREATE TABLE "googleRestaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "googleRestaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yelpRestaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "yelpRestaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurantMatches" (
    "googleRestaurantId" TEXT NOT NULL,
    "yelpRestaurantId" TEXT NOT NULL,
    "certainty" "Certainty" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurantMatches_googleRestaurantId_yelpRestaurantId_key" ON "restaurantMatches"("googleRestaurantId", "yelpRestaurantId");

-- AddForeignKey
ALTER TABLE "restaurantMatches" ADD CONSTRAINT "restaurantMatches_yelpRestaurantId_fkey" FOREIGN KEY ("yelpRestaurantId") REFERENCES "yelpRestaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantMatches" ADD CONSTRAINT "restaurantMatches_googleRestaurantId_fkey" FOREIGN KEY ("googleRestaurantId") REFERENCES "googleRestaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

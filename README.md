# Instructions

## Install dependecies

```
npm install
```

## Start database

Requires docker:

```
npm run db:up
```

## Seed database

Simple node script that loads restaurants from csv file into database.

```
npx prisma migrate reset # reset db and run all migrations
npm run seed
```

## Run matching algorithm

```
npm run match
```

# Algorithm description

The first step was to setup the database and examine the data. Knowing that we need to somehow match names and phones that are written slightly different I googled for algorithms that compare two strings and return the similarity percentage. I then went over every google restaurant and compared it with every yelp retaurant and logged similarity percentage between names that were greatard than 0.5. Then I tried to figure out from the data, what are the cases for Highest certinty. I noticed that all entries that have phone numbers with a similarity match greater than 0.8 are a match. Afterwards I excluded the ones that matched phone numbers and look for entries that are within a radius of 5km and started adjusting the name similarity threshold to see at what level we have a name match. That level was 0.4. From this data set that had name similarity > 0.4 and a distance between under 5km I examined what are the cases that can be of the Highest certinty. After examining the data I noticed that if the distance is under 1km and name similarity is of 0.4 we can be sure to be a match. Then I took the ones that had a name similarity over 0.4 and a distance between 1km and 5km. The ones here we can have a certinty of High if there is only one match. If there are multiple restaurants further that 1km but within 5km it means that we can't really know which is which, and therefore we have Medium certinty. Any other entry that doesn't match is excluded.

Draft of rules, starting from Highest to Medium

```
Highest
- phoneMatch(similarity > 0.8)
- geoMatch(distance < 1) & nameMatch(similarity > 0.4)
High
- geoMatch(distance >= 1 && distance < 5) & nameMatch(similarity > 0.4) && we encounter only one match
Medium
- geoMatch(distance >= 1 && distance < 5) & nameMatch(similarity > 0.4) && we encounter several restaurants in the same area
```

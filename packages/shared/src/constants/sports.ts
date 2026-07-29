export const SPORTS = [
  "Walking",
  "Trekking",
  "Hiking",
  "Badminton",
  "Table Tennis",
  "Yoga",
  "Pickleball",
  "Golf",
  "Paddleball",
  "Camping",
  "Cycling",
] as const;

export type Sport = (typeof SPORTS)[number];

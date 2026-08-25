// File: src/lib/photoTemplates.ts

export const coverPhotoMap = {
  Residential: "Front House",
  Commercial: "Shop Front",
  Industrial: "Factory Front",
  Land: "Front View",
} as const;

export const photoTemplates = {
  Residential: [
    "Front House",
    "Living Room",
    "Kitchen",
    "Master Bedroom",
    "Bedroom 2",
    "Bedroom 3",
    "Bathroom",
    "Car Porch",
    "Backyard",
  ],

  Commercial: [
    "Shop Front",
    "Interior",
    "Office Area",
    "Toilet",
    "Parking",
    "Road Frontage",
  ],

  Industrial: [
    "Factory Front",
    "Main Gate",
    "Office",
    "Warehouse",
    "Production Area",
    "Loading Bay",
    "Electrical Room",
    "Compound",
    "Road Access",
  ],

  Land: [
    "Front View",
    "Road Frontage",
    "Left Boundary",
    "Right Boundary",
    "Surrounding Area",
    "Drone View",
  ],
} as const;
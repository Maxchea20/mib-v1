// File: src/components/media/MediaManager.tsx

import PhotoCard from "./PhotoCard";

type Props = {
  propertyId: number;
  category: string;
};

const templates = {
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
};

export default function MediaManager({
  propertyId,
  category,
}: Props) {

  const photos =
    templates[
      category as keyof typeof templates
    ] ?? [];

  return (
    <div className="bg-white border rounded-lg shadow p-6 mt-8">

      <h2 className="text-2xl font-semibold text-black mb-6">
        Property Media Manager
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {photos.map((photo) => (

          <PhotoCard
            key={photo}
            propertyId={propertyId}
            photoType={photo}
          />

        ))}

      </div>

    </div>
  );
}
import Link from "next/link";

type Props = {
  buyer: any;
  properties: any[];
};

export default function OwnerPropertiesSection({
  buyer,
  properties,
}: Props) {

  console.log("Buyer:", buyer);
console.log("Owner Properties:", properties);

if (!properties || properties.length === 0) {
  return null;
}

  return (

    <div className="border-t p-8">

      <h2 className="text-2xl font-bold mb-6">
        🏠 Owner Properties
      </h2>

      {properties.length === 0 ? (

        <div className="bg-gray-50 border rounded-lg p-6">

          <p className="text-gray-500">
            No properties yet.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {properties.map((property) => (

            <div
              key={property.id}
              className="border rounded-lg p-5 flex justify-between items-center"
            >

              <div>

                <p className="font-bold text-lg text-black">
                  {property.title}
                </p>

                <p className="text-gray-600">
                  {property.category}
                </p>

                <p className="text-gray-600">
                  {property.area}
                </p>

                <p className="text-green-600 font-semibold">
                  RM {Number(property.price).toLocaleString()}
                </p>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                  {property.status}
                </span>

              </div>

              <Link
                href={`/listings/${property.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
              >
                Edit Listing
              </Link>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
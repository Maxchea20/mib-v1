import Link from "next/link";
import ContactMenu from "./ContactMenu";

type Props = {
  buyer: any;
};

export default function ContactCard({ buyer }: Props) {

  const property = buyer.ownerProperty;

  const category =
    buyer.is_owner
      ? property?.category
      : buyer.category;

  const purpose =
    buyer.is_owner
      ? buyer.owner_purpose
      : buyer.purpose;

  const price =
    buyer.is_owner
      ? property?.price
      : buyer.budget;

  const area =
    buyer.is_owner
      ? property?.area
      : buyer.preferred_location;

  return (

    <div className="relative bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200">

      {/* Clickable Card */}

      <Link
        href={`/contacts/${buyer.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Open ${buyer.name}`}
      />

      {/* Header */}

      <div className="relative z-10 flex items-start justify-between px-5 pt-3">

        <h2 className="text-2xl font-bold text-gray-900">

          {buyer.name}

        </h2>

        <div
          className="relative z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <ContactMenu
            id={buyer.id}
            name={buyer.name}
          />
        </div>

      </div>

      {/* Information Row */}

      <div className="relative z-10 flex flex-wrap items-center gap-6 px-5 pb-3 mt-3 text-base">

        {buyer.is_buyer && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            Buyer
          </span>
        )}

        {buyer.is_owner && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            Owner
          </span>
        )}

        {buyer.is_tenant && (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
            Tenant
          </span>
        )}

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          {buyer.status}
        </span>

        <span className="text-gray-700 text-lg">
          📞 {buyer.phone}
        </span>

        <span className="text-blue-600 text-lg font-semibold">
          {purpose || "-"}
        </span>

        <span className="text-gray-900 text-lg font-bold">
          {category || "-"}
        </span>

        <span className="text-green-600 text-lg font-bold">
          {price
            ? `RM ${Number(price).toLocaleString()}`
            : "-"}
        </span>

        <span className="text-gray-500 text-lg font-semibold">
          {area || "-"}
        </span>

      </div>

    </div>

  );

}
type Props = {
  buyer: any;
};

export default function RoleBadge({ buyer }: Props) {
  return (
    <div className="flex flex-wrap gap-2">

      {buyer.is_buyer && (
        <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold">
          Buyer
        </span>
      )}

      {buyer.is_owner && (
        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-semibold">
          Owner
        </span>
      )}

      {buyer.is_tenant && (
        <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-sm font-semibold">
          Tenant
        </span>
      )}

    </div>
  );
}
type Props = {
  isBuyer: boolean;
  setIsBuyer: (value: boolean) => void;

  isOwner: boolean;
  setIsOwner: (value: boolean) => void;

  isTenant: boolean;
  setIsTenant: (value: boolean) => void;
};

export default function RolesSection({
  isBuyer,
  setIsBuyer,
  isOwner,
  setIsOwner,
  isTenant,
  setIsTenant,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">

      <h2 className="text-lg font-semibold mb-4">
  Role
</h2>

      <div className="flex items-center gap-8">

        <label className="flex items-center gap-2 cursor-pointer">

          <input
  type="checkbox"
  checked={isBuyer}
  onChange={(e) =>
    setIsBuyer(e.target.checked)
  }
  className="w-5 h-5 accent-blue-600 cursor-pointer"
/>

          Buyer

        </label>

        <label className="flex items-center gap-2 cursor-pointer">

          <input
  type="checkbox"
  checked={isOwner}
  onChange={(e) =>
    setIsOwner(e.target.checked)
  }
  className="w-5 h-5 accent-blue-600 cursor-pointer"
/>

          Owner

        </label>

        <label className="flex items-center gap-2 cursor-pointer">

          <input
  type="checkbox"
  checked={isTenant}
  onChange={(e) =>
    setIsTenant(e.target.checked)
  }
  className="w-5 h-5 accent-blue-600 cursor-pointer"
/>

          Tenant

        </label>

      </div>

    </div>
  );
}
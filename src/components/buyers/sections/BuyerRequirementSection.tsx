type Props = {
  purpose: string;
  setPurpose: (value: string) => void;

  budget: string;
  onBudgetChange: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  preferredLocation: string;
  setPreferredLocation: (value: string) => void;
};

export default function BuyerRequirementSection({
  purpose,
  setPurpose,
  budget,
  onBudgetChange,
  category,
  setCategory,
  preferredLocation,
  setPreferredLocation,
}: Props) {
  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        🛒 Requirement
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="border rounded p-3 text-black"
        >
          <option>Buy</option>
          <option>Rent</option>
        </select>

        <input
          type="text"
          placeholder="Budget"
          value={budget ? `RM ${budget}` : ""}
          onChange={(e) => onBudgetChange(e.target.value)}
          className="border rounded p-3 text-black"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-3 text-black"
        >
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Land</option>
        </select>

        <input
          type="text"
          placeholder="Preferred Location"
          value={preferredLocation}
          onChange={(e) =>
            setPreferredLocation(e.target.value)
          }
          className="border rounded p-3 text-black"
        />

      </div>

    </div>

  );
}
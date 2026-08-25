type Props = {
  purpose: string;
  setPurpose: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  area: string;
  setArea: (value: string) => void;

  state: string;
  setState: (value: string) => void;

  price: string;
  onPriceChange: (value: string) => void;
};

export default function OwnerSection({
  purpose,
  setPurpose,
  category,
  setCategory,
  area,
  setArea,
  state,
  setState,
  price,
  onPriceChange,
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        Owner Information
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="border rounded p-3 text-black"
        >
          <option>Sell</option>
          <option>Rent</option>
        </select>

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
          placeholder="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border rounded p-3 text-black"
        />

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border rounded p-3 text-black"
        >
          <option>Perak</option>
          <option>Selangor</option>
          <option>Penang</option>
          <option>Kedah</option>
          <option>Johor</option>
          <option>Kuala Lumpur</option>
          <option>Negeri Sembilan</option>
          <option>Melaka</option>
          <option>Pahang</option>
          <option>Terengganu</option>
          <option>Kelantan</option>
          <option>Perlis</option>
          <option>Sabah</option>
          <option>Sarawak</option>
        </select>

        <input
          type="text"
          placeholder="Price"
          value={price ? `RM ${price}` : ""}
          onChange={(e) => onPriceChange(e.target.value)}
          className="border rounded p-3 text-black"
        />

      </div>

    </div>

  );

}
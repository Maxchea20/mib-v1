// File: src/components/buyers/sections/CommercialSection.tsx

type Props = {
  commercialType: string;
  setCommercialType: (value: string) => void;
};

export default function CommercialSection({
  commercialType,
  setCommercialType,
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        🏢 Commercial Requirement
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          value={commercialType}
          onChange={(e) =>
            setCommercialType(e.target.value)
          }
          className="border rounded p-3 text-black"
        >
          <option>Shoplot</option>
          <option>Office</option>
          <option>Retail</option>
          <option>Showroom</option>
          <option>Hotel</option>
        </select>

      </div>

    </div>

  );

}
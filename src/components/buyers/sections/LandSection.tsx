// File: src/components/buyers/sections/LandSection.tsx

type Props = {
  landType: string;
  setLandType: (value: string) => void;

  landSize: string;
  setLandSize: (value: string) => void;
};

export default function LandSection({
  landType,
  setLandType,
  landSize,
  setLandSize,
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        🌳 Land Requirement
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          value={landType}
          onChange={(e) =>
            setLandType(e.target.value)
          }
          className="border rounded p-3 text-black"
        >
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Agriculture</option>
        </select>

        <input
          type="text"
          placeholder="Land Size"
          value={landSize}
          onChange={(e) =>
            setLandSize(e.target.value)
          }
          className="border rounded p-3 text-black"
        />

      </div>

    </div>

  );

}
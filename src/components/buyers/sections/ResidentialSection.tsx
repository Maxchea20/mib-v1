// File: src/components/buyers/sections/ResidentialSection.tsx

type Props = {
  residentialType: string;
  setResidentialType: (value: string) => void;

  residentialStorey: string;
  setResidentialStorey: (value: string) => void;
};

export default function ResidentialSection({
  residentialType,
  setResidentialType,
  residentialStorey,
  setResidentialStorey,
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        🏠 Residential Requirement
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          value={residentialType}
          onChange={(e) =>
            setResidentialType(e.target.value)
          }
          className="border rounded p-3 text-black"
        >
          <option>Terrace</option>
          <option>Semi Detached</option>
          <option>Bungalow</option>
          <option>Apartment / Condo</option>
          <option>Townhouse</option>
        </select>

        <select
          value={residentialStorey}
          onChange={(e) =>
            setResidentialStorey(e.target.value)
          }
          className="border rounded p-3 text-black"
        >
          <option>Single</option>
          <option>Double</option>
          <option>2.5</option>
          <option>Triple</option>
        </select>

      </div>

    </div>

  );

}
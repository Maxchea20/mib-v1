// File: src/components/buyers/sections/IndustrialSection.tsx

type Props = {
  industrialPropertyType: string;
  setIndustrialPropertyType: (value: string) => void;

  industrialZoning: string;
  setIndustrialZoning: (value: string) => void;

  industrialLandSize: string;
  setIndustrialLandSize: (value: string) => void;

  industrialBuiltUp: string;
  setIndustrialBuiltUp: (value: string) => void;

  industrialCeilingHeight: string;
  setIndustrialCeilingHeight: (value: string) => void;

  industrialPowerSupply: string;
  setIndustrialPowerSupply: (value: string) => void;
};

export default function IndustrialSection({
  industrialPropertyType,
  setIndustrialPropertyType,
  industrialZoning,
  setIndustrialZoning,
  industrialLandSize,
  setIndustrialLandSize,
  industrialBuiltUp,
  setIndustrialBuiltUp,
  industrialCeilingHeight,
  setIndustrialCeilingHeight,
  industrialPowerSupply,
  setIndustrialPowerSupply,
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        🏭 Industrial Requirement
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          value={industrialPropertyType}
          onChange={(e) =>
            setIndustrialPropertyType(e.target.value)
          }
          className="border rounded p-3 text-black"
        >
          <option>Detached Factory</option>
          <option>Semi Detached Factory</option>
          <option>Warehouse</option>
          <option>Factory Lot</option>
        </select>

        <select
          value={industrialZoning}
          onChange={(e) =>
            setIndustrialZoning(e.target.value)
          }
          className="border rounded p-3 text-black"
        >
          <option>Light</option>
          <option>Medium</option>
          <option>Heavy</option>
        </select>

        <input
          type="text"
          placeholder="Land Size"
          value={industrialLandSize}
          onChange={(e) =>
            setIndustrialLandSize(e.target.value)
          }
          className="border rounded p-3 text-black"
        />

        <input
          type="text"
          placeholder="Built-up"
          value={industrialBuiltUp}
          onChange={(e) =>
            setIndustrialBuiltUp(e.target.value)
          }
          className="border rounded p-3 text-black"
        />

        <input
          type="text"
          placeholder="Ceiling Height"
          value={industrialCeilingHeight}
          onChange={(e) =>
            setIndustrialCeilingHeight(e.target.value)
          }
          className="border rounded p-3 text-black"
        />

        <input
          type="text"
          placeholder="Power Supply"
          value={industrialPowerSupply}
          onChange={(e) =>
            setIndustrialPowerSupply(e.target.value)
          }
          className="border rounded p-3 text-black"
        />

      </div>

    </div>

  );

}
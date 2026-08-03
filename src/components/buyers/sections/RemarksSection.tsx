// File: src/components/buyers/sections/RemarksSection.tsx

type Props = {
  remarks: string;
  setRemarks: (value: string) => void;
};

export default function RemarksSection({
  remarks,
  setRemarks,
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        📝 Remarks
      </h3>

      <textarea
        rows={5}
        placeholder="Remarks..."
        value={remarks}
        onChange={(e) =>
          setRemarks(e.target.value)
        }
        className="w-full border rounded p-3 text-black"
      />

    </div>

  );

}
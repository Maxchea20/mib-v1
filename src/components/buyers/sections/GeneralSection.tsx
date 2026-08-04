// File: src/components/buyers/sections/GeneralSection.tsx

type Props = {
  name: string;
  setName: (value: string) => void;

  phone: string;
  setPhone: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  leadSource: string;
  setLeadSource: (value: string) => void;

  
};

export default function GeneralSection({
  name,
  setName,
  phone,
  setPhone,
  status,
  setStatus,
  leadSource,
  setLeadSource,
  
}: Props) {

  return (

    <div>

      <h3 className="text-xl font-semibold text-black mb-4">
        👤 Contact Information
      </h3>

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="Contact Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-3 text-black"
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border rounded p-3 text-black"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded p-3 text-black"
        >
          <option>Active</option>
          <option>Closed</option>
          <option>Lost</option>
        </select>

        <select
          value={leadSource}
          onChange={(e) => setLeadSource(e.target.value)}
          className="border rounded p-3 text-black"
        >
          <option>Facebook</option>
          <option>PropertyGuru</option>
          <option>iProperty</option>
          <option>Referral</option>
          <option>Existing Client</option>
        </select>

        

        

        

        

      </div>

    </div>

  );

}
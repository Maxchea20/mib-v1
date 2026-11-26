export const dynamic = "force-dynamic";

import IntakeBoard from "@/components/intake/IntakeBoard";

/*
| MIB > Listing intake. Paste a Facebook post link from a co-broke agent, type the agent's name and
| press Add: it is saved in the table below. The links are sent to the MIB Desktop worker one at
| a time, which makes a DRAFT listing (never public) for you to check.
*/

export default function IntakePage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Listing intake</h1>
      <p className="mt-2 text-slate-600">
        Add Facebook links one by one, with the co-broke agent&apos;s name. They are saved in the table first. Then they go to the worker on your PC,
        one link at a time, and each becomes a draft listing for you to check. Nothing is published by itself.
      </p>
      <IntakeBoard />
    </div>
  );
}

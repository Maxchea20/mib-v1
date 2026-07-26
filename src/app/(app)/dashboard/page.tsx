import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {
   return (
    
      <div className="rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-3 text-slate-600">
          Welcome back, Max.
        </p>
      </div>
   
  );
}
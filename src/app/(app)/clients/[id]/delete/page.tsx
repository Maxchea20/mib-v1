import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DeleteClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  async function deleteClient() {
    "use server";

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    redirect("/clients");
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-md">
      <h1 className="text-3xl font-bold text-black">
        Delete Client
      </h1>

      <p className="mt-4 text-black">
        Are you sure you want to delete this client?
      </p>

      <div className="flex gap-3 mt-6">
        <Link
          href="/clients"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Cancel
        </Link>

        <form action={deleteClient}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Yes, Delete
          </button>
        </form>
      </div>
    </div>
  );
}
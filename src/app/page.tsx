import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <TopBar />

        <div className="p-8">
          <div className="rounded-xl bg-white p-8 shadow">
            <h1 className="text-3xl font-bold">
              Welcome to Max Intelligence Business 🚀
            </h1>

            <p className="mt-3 text-slate-600">
              Your Real Estate Operating System has officially begun.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
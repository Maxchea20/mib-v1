export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="font-medium">
        Welcome, Max 👋
      </div>
    </header>
  );
}
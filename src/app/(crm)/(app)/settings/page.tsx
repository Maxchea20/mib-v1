import PhotoOptimizer from "@/components/settings/PhotoOptimizer";
import VideoCleaner from "@/components/settings/VideoCleaner";

export default function SettingsPage() {
  return (
   
    <div>
      <h1 className="text-3xl font-bold">
        Settings
      </h1>

      <p className="mt-2 text-slate-600">
        System configuration.
      </p>

      <PhotoOptimizer />

      <VideoCleaner />
    </div>
    
  );
}
import { WifiOff } from "lucide-react";

const OfflineBanner = () => (
  <div className="w-full bg-destructive/10 border-b border-destructive/20 text-destructive px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2">
    <WifiOff className="w-4 h-4" />
    You are currently offline. You can still read your saved explanations below.
  </div>
);

export default OfflineBanner;

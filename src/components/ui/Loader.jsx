import { Loader2 } from 'lucide-react';

/**
 * Full-area spinner shown while data is loading.
 * Centers itself in whatever container it's placed in.
 */
export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  );
}

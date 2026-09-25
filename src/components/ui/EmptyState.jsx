import { PackageOpen } from 'lucide-react';

export default function EmptyState({ message = 'No products found.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
      <PackageOpen className="w-12 h-12" />
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}

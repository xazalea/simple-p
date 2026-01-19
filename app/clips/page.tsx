'use client';

import { useRouter } from 'next/navigation';
import { Star, ArrowLeft } from 'lucide-react';

export default function Clips() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">My Clips</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="text-center py-12">
          <Star size={64} className="mx-auto mb-4 text-white" />
          <p className="text-gray-400">No clips yet. Clip messages to save them here.</p>
        </div>
      </div>
    </div>
  );
}

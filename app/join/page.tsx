'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, ArrowLeft } from 'lucide-react';

export default function JoinChat() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-black border-2 border-white rounded-lg shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Join Chat Room
          </h2>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <Link2 size={20} />
              <span>Join Room</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-gray-300 text-sm transition-colors flex items-center space-x-1 mx-auto"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

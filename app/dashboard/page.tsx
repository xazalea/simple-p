'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Globe, Plus, Link2, Star, LogOut, Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [showSecureId, setShowSecureId] = useState(false);
  const [secureId, setSecureId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('username');
    const id = localStorage.getItem('secureId');
    if (!stored || !id) {
      router.push('/');
      return;
    }
    setUsername(stored);
    setSecureId(id);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black border-2 border-white rounded-lg p-8 mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, {username}</h2>
              <p className="text-gray-400">Choose an option to get started</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black">Your Secure ID</span>
              <button
                onClick={() => setShowSecureId(!showSecureId)}
                className="text-sm text-black hover:text-gray-600 transition-colors flex items-center space-x-1"
              >
                {showSecureId ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showSecureId ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {showSecureId && (
              <p className="text-sm text-gray-600 font-mono bg-gray-100 p-3 rounded border-2 border-gray-300 break-all">
                {secureId}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => router.push('/chat/global')}
            className="bg-black border-2 border-white hover:bg-white hover:text-black text-white rounded-lg p-8 transition-all duration-200 shadow-xl animate-fadeIn group"
          >
            <Globe size={48} className="mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-2">Global Chat</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-600">Join the public chat room</p>
          </button>

          <button
            onClick={() => router.push('/create')}
            className="bg-black border-2 border-white hover:bg-white hover:text-black text-white rounded-lg p-8 transition-all duration-200 shadow-xl animate-fadeIn group"
            style={{ animationDelay: '0.1s' }}
          >
            <Plus size={48} className="mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-2">Create Chat</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-600">Start a new private room</p>
          </button>

          <button
            onClick={() => router.push('/join')}
            className="bg-black border-2 border-white hover:bg-white hover:text-black text-white rounded-lg p-8 transition-all duration-200 shadow-xl animate-fadeIn group"
            style={{ animationDelay: '0.2s' }}
          >
            <Link2 size={48} className="mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-2">Join Chat</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-600">Enter with a room code</p>
          </button>

          <button
            onClick={() => router.push('/clips')}
            className="bg-black border-2 border-white hover:bg-white hover:text-black text-white rounded-lg p-8 transition-all duration-200 shadow-xl animate-fadeIn group"
            style={{ animationDelay: '0.3s' }}
          >
            <Star size={48} className="mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-2">My Clips</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-600">View saved messages</p>
          </button>
        </div>
      </div>
    </div>
  );
}

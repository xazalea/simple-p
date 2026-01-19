'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, User } from 'lucide-react';
import { FancyButton } from './components/FancyButton';
import { FancyInput } from './components/FancyInput';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    // Validate username (alphanumeric only)
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanUsername.length < 2) {
      setError('Username must be at least 2 characters (letters and numbers only)');
      return;
    }
    
    if (cleanUsername !== username.toLowerCase()) {
      setError('Username can only contain letters and numbers');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Use username as peer ID directly
    const peerId = cleanUsername;
    
    localStorage.setItem('username', cleanUsername);
    localStorage.setItem('peerId', peerId);
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Eclipse V2
          </h1>
          <p className="text-gray-400">Simple P2P Chat</p>
        </div>

        <div className="glass rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose a Username
              </label>
              <FancyInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alice, bob123"
                icon={<User size={20} />}
              />
              <p className="text-xs text-gray-400 mt-2">
                Letters and numbers only, at least 2 characters
              </p>
              {error && (
                <p className="text-xs text-red-400 mt-2">
                  {error}
                </p>
              )}
            </div>

            <div className="w-full flex justify-center mt-8">
              <FancyButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                <LogIn size={20} className="inline-block mr-2" />
                <span>{loading ? 'Entering...' : 'Enter Eclipse'}</span>
              </FancyButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

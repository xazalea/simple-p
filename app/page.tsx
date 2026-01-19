'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    // Initialize FingerprintJS
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    initFingerprint();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;
    if (!fingerprint) {
      alert('Security check in progress...');
      return;
    }

    // Use username + fingerprint as secure identifier
    const secureId = `${username}-${fingerprint}`;
    localStorage.setItem('username', username);
    localStorage.setItem('secureId', secureId);
    localStorage.setItem('fingerprint', fingerprint);
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-black border-2 border-white rounded-lg shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              {isLogin ? (
                <>
                  <LogIn size={20} />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:text-gray-300 text-sm transition-colors"
            >
              {isLogin ? 'Create new account' : 'Already have an account?'}
            </button>
          </div>

          {fingerprint && (
            <div className="mt-6 p-3 bg-white rounded border-2 border-gray-300">
              <p className="text-xs text-gray-600 text-center">
                Secured with device fingerprint
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

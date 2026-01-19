'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MonitorUp, Mic, Send, X } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [dmTarget, setDmTarget] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (!stored) {
      router.push('/');
      return;
    }
    setUsername(stored);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: username,
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const handleVoiceChat = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  const handleUserClick = (sender: string) => {
    if (sender !== username) {
      setDmTarget(sender);
      setShowDM(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-black border-b-2 border-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-gray-300 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h2 className="text-xl font-bold text-white">
              {roomId === 'global' ? 'Global Chat' : `Room: ${roomId}`}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleScreenShare}
              className={`p-3 rounded-lg transition-all border-2 ${
                isScreenSharing
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-white border-white hover:bg-white hover:text-black'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <MonitorUp size={20} />
            </button>
            <button
              onClick={handleVoiceChat}
              className={`p-3 rounded-lg transition-all border-2 ${
                isVoiceActive
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-white border-white hover:bg-white hover:text-black'
              }`}
              title={isVoiceActive ? 'Stop Voice' : 'Start Voice'}
            >
              <Mic size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        <div className="max-w-6xl mx-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="bg-black border-2 border-gray-300 rounded-lg p-4 hover:border-white transition-colors">
                <div className="flex items-center space-x-2 mb-1">
                  <button
                    onClick={() => handleUserClick(msg.sender)}
                    className="font-semibold text-white hover:text-gray-300 hover:underline transition-colors"
                  >
                    {msg.sender}
                  </button>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white">{msg.content}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-black border-t-2 border-white p-4">
        <form onSubmit={handleSend} className="max-w-6xl mx-auto flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white hover:bg-gray-200 text-black font-semibold rounded-lg transition-all flex items-center space-x-2"
          >
            <Send size={20} />
            <span>Send</span>
          </button>
        </form>
      </div>

      {showDM && (
        <div className="fixed bottom-4 right-4 w-96 bg-black border-2 border-white rounded-lg shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b-2 border-white">
            <h3 className="font-semibold text-white">DM: {dmTarget}</h3>
            <button
              onClick={() => setShowDM(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto custom-scrollbar bg-white">
            <p className="text-gray-500 text-sm text-center">Start a private conversation</p>
          </div>
          <div className="p-4 border-t-2 border-white">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 text-sm focus:border-white focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

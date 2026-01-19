'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Peer, { DataConnection } from 'peerjs';
import { ArrowLeft, MonitorUp, Mic, MicOff, Send, Copy, Check, Users as UsersIcon, UserPlus } from 'lucide-react';
import { FancyButton } from '../../components/FancyButton';
import { FancyInput } from '../../components/FancyInput';

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: number;
  type?: 'message' | 'system';
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [peerId, setPeerId] = useState('');
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<Map<string, DataConnection>>(new Map());
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  
  const [connectUsername, setConnectUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const remoteScreenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('username');
    const id = localStorage.getItem('peerId');
    
    if (!stored || !id) {
      router.push('/');
      return;
    }
    
    setUsername(stored);
    setPeerId(id);
    
    // Initialize PeerJS
    const newPeer = new Peer(id, {
      debug: 2,
    });
    
    newPeer.on('open', (id) => {
      console.log('Connected with peer ID:', id);
      setPeer(newPeer);
      
      // Add system message
      addSystemMessage(`You joined as ${stored}`);
    });
    
    newPeer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      handleConnection(conn);
    });
    
    newPeer.on('call', (call) => {
      console.log('Incoming call from:', call.peer);
      call.answer();
      call.on('stream', (remoteStream) => {
        if (remoteScreenRef.current) {
          remoteScreenRef.current.srcObject = remoteStream;
        }
      });
    });
    
    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      if (error.type === 'unavailable-id') {
        setConnectionError('Username is already taken. Please choose another.');
        setTimeout(() => router.push('/'), 2000);
      }
    });
    
    return () => {
      connections.forEach(conn => conn.close());
      newPeer.destroy();
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (voiceStream) {
        voiceStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  // Auto-connect logic for global room
  useEffect(() => {
    if (roomId === 'global' && peer) {
      // Check URL for friend's username
      const urlParams = new URLSearchParams(window.location.search);
      const friendUsername = urlParams.get('connect');
      
      if (friendUsername && friendUsername !== username) {
        setConnectUsername(friendUsername);
        setTimeout(() => {
          connectToPeer(friendUsername);
        }, 1000);
      }
      
      // Load previously connected peers
      const knownPeers = JSON.parse(localStorage.getItem('knownPeers') || '[]');
      knownPeers.forEach((peerUsername: string) => {
        if (peerUsername !== username && !connections.has(peerUsername)) {
          setTimeout(() => connectToPeer(peerUsername), 500);
        }
      });
    }
  }, [roomId, peer, username]);

  // Save connected peers
  useEffect(() => {
    if (connectedPeers.length > 0) {
      localStorage.setItem('knownPeers', JSON.stringify(connectedPeers));
    }
  }, [connectedPeers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addSystemMessage = (content: string) => {
    const sysMsg: Message = {
      id: Date.now().toString() + '-system',
      sender: 'System',
      senderId: 'system',
      content,
      timestamp: Date.now(),
      type: 'system'
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  const handleConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      console.log('Connection opened with:', conn.peer);
      setConnections(prev => {
        const newMap = new Map(prev);
        newMap.set(conn.peer, conn);
        return newMap;
      });
      setConnectedPeers(prev => {
        if (!prev.includes(conn.peer)) {
          addSystemMessage(`${conn.peer} joined the chat`);
          return [...prev, conn.peer];
        }
        return prev;
      });
      setConnectionError('');
      setConnecting(false);
    });

    conn.on('data', (data: any) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      }
    });

    conn.on('close', () => {
      console.log('Connection closed with:', conn.peer);
      setConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(conn.peer);
        return newMap;
      });
      setConnectedPeers(prev => {
        const filtered = prev.filter(p => p !== conn.peer);
        if (prev.includes(conn.peer)) {
          addSystemMessage(`${conn.peer} left the chat`);
        }
        return filtered;
      });
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(`Failed to connect to ${conn.peer}`);
      setConnecting(false);
    });
  };

  const connectToPeer = (targetUsername: string) => {
    if (!peer || !targetUsername) return;
    
    const cleanUsername = targetUsername.toLowerCase().trim();
    
    if (cleanUsername === username) {
      setConnectionError("You can't connect to yourself!");
      return;
    }
    
    if (connections.has(cleanUsername)) {
      setConnectionError(`Already connected to ${cleanUsername}`);
      return;
    }
    
    setConnecting(true);
    setConnectionError('');
    
    try {
      const conn = peer.connect(cleanUsername, {
        reliable: true,
      });
      handleConnection(conn);
      
      // Timeout if connection takes too long
      setTimeout(() => {
        if (connecting && !connections.has(cleanUsername)) {
          setConnectionError(`Couldn't reach ${cleanUsername}. Make sure they're online.`);
          setConnecting(false);
        }
      }, 10000);
    } catch (error) {
      console.error('Error connecting:', error);
      setConnectionError(`Failed to connect to ${cleanUsername}`);
      setConnecting(false);
    }
  };

  const handleConnectUser = () => {
    if (connectUsername.trim()) {
      connectToPeer(connectUsername);
    }
  };

  const copyUsername = () => {
    navigator.clipboard.writeText(username);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const broadcastMessage = (message: Message) => {
    connections.forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'message', message });
      }
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: username,
      senderId: peerId,
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, message]);
    broadcastMessage(message);
    setInput('');
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        
        // Share with all connected peers
        connections.forEach(conn => {
          if (peer) {
            const call = peer.call(conn.peer, stream);
          }
        });
        
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } catch (error) {
        console.error('Screen share error:', error);
        alert('Failed to share screen. Please grant permission.');
      }
    }
  };

  const handleVoiceChat = async () => {
    if (isVoiceActive) {
      if (voiceStream) {
        voiceStream.getTracks().forEach(track => track.stop());
        setVoiceStream(null);
      }
      setIsVoiceActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
        
        setVoiceStream(stream);
        setIsVoiceActive(true);
        
        // Share with all connected peers
        connections.forEach(conn => {
          if (peer) {
            const call = peer.call(conn.peer, stream);
          }
        });
      } catch (error) {
        console.error('Voice chat error:', error);
        alert('Failed to start voice chat. Please grant microphone permission.');
      }
    }
  };


  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="glass glass-hover px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <div>
                <h2 className="text-2xl font-bold">
                  {roomId === 'global' ? 'Global Chat' : `Room: ${roomId}`}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${connectedPeers.length > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs text-gray-400">
                    {connectedPeers.length > 0 
                      ? `Connected to: ${connectedPeers.join(', ')}` 
                      : 'Not connected'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="glass px-3 py-2 rounded-lg flex items-center space-x-2">
                <UsersIcon size={16} />
                <span className="text-sm">{connectedPeers.length + 1}</span>
              </div>
              
              <FancyButton 
                onClick={handleScreenShare}
                variant="icon"
                className={isScreenSharing ? 'opacity-100' : 'opacity-80'}
              >
                <MonitorUp size={20} />
              </FancyButton>
              
              <FancyButton 
                onClick={handleVoiceChat}
                variant="icon"
                className={isVoiceActive ? 'opacity-100' : 'opacity-80'}
              >
                {isVoiceActive ? <Mic size={20} /> : <MicOff size={20} />}
              </FancyButton>
            </div>
          </div>

          {/* Connection Section */}
          <div className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your username:</span>
                <button
                  onClick={copyUsername}
                  className="glass glass-hover px-3 py-1.5 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition-all"
                >
                  {username}
                  {copiedUsername ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="text-gray-600">|</div>
              <div className="flex-1 flex items-center gap-2">
                <UserPlus size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnectUser()}
                  placeholder="Enter friend's username to connect"
                  className="flex-1 px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-white/30 focus:outline-none"
                />
                <FancyButton
                  onClick={handleConnectUser}
                  variant="small"
                  disabled={connecting || !connectUsername.trim()}
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </FancyButton>
              </div>
            </div>
          </div>
          
          {connectionError && (
            <div className="mt-2 text-red-400 text-sm text-center">
              {connectionError}
            </div>
          )}
        </div>
      </div>

      {/* Screen Share Display */}
      {(isScreenSharing || screenStream) && (
        <div className="bg-black/50 p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-gray-400 mb-2">Your Screen:</p>
            <video
              ref={screenVideoRef}
              autoPlay
              muted
              className="w-full max-w-2xl rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Remote Screen Display */}
      <video
        ref={remoteScreenRef}
        autoPlay
        className="hidden"
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Welcome to {roomId === 'global' ? 'Global Chat' : 'Chat Room'}! 👋</h3>
                <div className="text-left space-y-3 text-gray-300">
                  <p className="text-sm">To connect with friends:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Share your username: <span className="font-bold text-white">{username}</span></li>
                    <li>Ask them to enter your username in the box above</li>
                    <li>Start chatting!</li>
                  </ol>
                  <p className="text-sm mt-4 text-gray-400">
                    Or enter a friend's username above to connect with them.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              msg.type === 'system' ? (
                <div key={msg.id} className="text-center">
                  <span className="text-xs text-gray-500 bg-black/30 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className={`glass rounded-xl p-4 animate-slideUp ${
                    msg.senderId === peerId ? 'ml-auto max-w-xl' : 'mr-auto max-w-xl'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-semibold ${msg.senderId === peerId ? 'text-blue-400' : 'text-green-400'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-200">{msg.content}</p>
                </div>
              )
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass border-t border-white/10 p-4">
        <form onSubmit={handleSend} className="max-w-7xl mx-auto flex space-x-4 items-center">
          <div className="flex-1">
            <FancyInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={connectedPeers.length > 0 ? `Message ${roomId === 'global' ? 'Global Chat' : roomId}...` : 'Connect to someone first...'}
              icon={<Send size={18} />}
            />
          </div>
          <FancyButton type="submit" variant="small" disabled={!input.trim() || connectedPeers.length === 0}>
            <Send size={20} className="inline-block mr-2" />
            <span>Send</span>
          </FancyButton>
        </form>
        {connectedPeers.length === 0 && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Enter a friend's username above to start chatting
          </p>
        )}
      </div>
    </div>
  );
}

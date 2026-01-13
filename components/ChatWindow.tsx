import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AICompatibilityResult, ChatMessage } from '../types';
import { Send, Lock, Sparkles, ChevronLeft } from 'lucide-react';

interface ChatWindowProps {
  matchProfile: UserProfile;
  aiData: AICompatibilityResult | null;
  isPaid: boolean;
  onUnlockClick: () => void;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ matchProfile, aiData, isPaid, onUnlockClick, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'match',
          text: `Hey! I noticed we both like ${matchProfile.interests[0]}.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [matchProfile]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const useIcebreaker = () => {
    if (!isPaid) {
      onUnlockClick();
      return;
    }
    if (aiData?.icebreaker) {
      setInputText(aiData.icebreaker);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-white/10 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <img src={matchProfile.imageUrl} alt={matchProfile.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
        </div>
        <div>
          <h3 className="font-bold text-white">{matchProfile.name}</h3>
          <p className="text-xs text-gold-400 font-medium">Vantage Score: {aiData?.score || 0}%</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.sender === 'user' 
                ? 'bg-purple-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Magic Icebreaker Area */}
      <div className="px-4 pb-2">
        <button
          onClick={useIcebreaker}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            isPaid 
              ? 'bg-purple-900/30 border-purple-500/50 hover:bg-purple-900/50' 
              : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isPaid ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className={`block text-xs font-bold uppercase ${isPaid ? 'text-purple-300' : 'text-slate-500'}`}>
                Vantage AI
              </span>
              <span className={`text-sm ${isPaid ? 'text-white' : 'text-slate-400'}`}>
                Generate Magic Icebreaker
              </span>
            </div>
          </div>
          {!isPaid && <Lock className="w-4 h-4 text-gold-500" />}
        </button>
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
        <button 
          onClick={handleSend}
          className="p-3 bg-gold-500 hover:bg-gold-400 text-black rounded-full transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
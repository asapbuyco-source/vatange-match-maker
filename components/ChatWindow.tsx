import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AICompatibilityResult, ChatMessage } from '../types';
import { Send, Lock, Sparkles, ChevronLeft, MoreVertical, Shield } from 'lucide-react';

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
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-2 pt-4 bg-slate-900 border-b border-white/5 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-1">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-rose-500">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="relative">
            <img src={matchProfile.imageUrl} alt={matchProfile.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="ml-2">
             <h3 className="font-bold text-white text-lg leading-tight">{matchProfile.name}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pr-2">
           <button className="p-2 rounded-full bg-slate-800 text-slate-400">
              <Shield className="w-5 h-5" />
           </button>
           <button className="p-2 rounded-full text-slate-400">
              <MoreVertical className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
        <div className="text-center text-xs text-slate-500 my-4 font-medium uppercase tracking-wide">
           You Matched with {matchProfile.name}
        </div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-5 py-3 text-[15px] leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-[20px] rounded-br-none' 
                : 'bg-slate-800 text-white rounded-[20px] rounded-bl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Magic Icebreaker Suggestion */}
        {messages.length < 3 && (
           <div className="flex justify-center mt-6">
              <button
                onClick={useIcebreaker}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-gold-500/30 text-gold-500 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {isPaid ? "Generate Icebreaker" : "Unlock Magic Icebreaker"}
                {!isPaid && <Lock className="w-3 h-3 ml-1" />}
              </button>
           </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-white/5 flex gap-2 items-end pb-6">
        <div className="flex-1 bg-slate-800 rounded-[24px] flex items-center border border-transparent focus-within:border-rose-500/50 transition-colors">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none px-4 py-3 text-white focus:outline-none placeholder:text-slate-500"
            />
        </div>
        <button 
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`p-3 rounded-full transition-all ${
             inputText.trim() 
             ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg transform scale-100' 
             : 'bg-slate-800 text-slate-500 transform scale-95'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
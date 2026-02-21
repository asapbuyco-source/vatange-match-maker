import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, AICompatibilityResult, ChatMessage, Theme } from '../types';
import { Send, Lock, Sparkles, ChevronLeft, MoreVertical, Shield, Flag, UserX } from 'lucide-react';

interface ChatWindowProps {
  matchProfile: UserProfile;
  aiData: AICompatibilityResult | null;
  subscriptionTier: string;
  onUnlockClick: () => void;
  onBack: () => void;
  theme: Theme;
}

// Simulated match responses
const MATCH_REPLIES: Record<string, string[]> = {
  default: [
    "That's so interesting! Tell me more 😊",
    "Haha yes! I totally agree with that.",
    "I was thinking the same thing! What else do you like?",
    "OK I need to know more about you now 😂",
    "That's actually really cool. You seem like a fun person!",
    "Omg yes! We have so much in common already.",
    "Wow I wasn't expecting that answer 😄",
    "You're making me smile over here 😊",
    "Hahaha okay that's a vibe. Continue...",
    "So what are you doing this weekend?",
  ]
};

const getReply = (interest: string): string => {
  const replies = MATCH_REPLIES[interest] || MATCH_REPLIES.default;
  return replies[Math.floor(Math.random() * replies.length)];
};

const ChatWindow: React.FC<ChatWindowProps> = ({ matchProfile, aiData, subscriptionTier, onUnlockClick, onBack, theme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isPaid = subscriptionTier !== 'free';

  const accent = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';

  // Initial greeting from match
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        sender: 'match',
        text: `Hey! I noticed we both like ${matchProfile.interests[0] || 'the same things'} 😊`,
        timestamp: new Date(),
        isRead: true,
      }]);
    }
  }, [matchProfile]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const simulateReply = useCallback(() => {
    const delay = 800 + Math.random() * 1500;
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: Date.now().toString(),
        sender: 'match',
        text: getReply(matchProfile.interests[0]),
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => [...prev, reply]);
    }, delay);
  }, [matchProfile.interests]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Trigger reply after user sends
    setTimeout(() => simulateReply(), 300);
  }, [inputText, simulateReply]);

  const useIcebreaker = () => {
    if (!isPaid) { onUnlockClick(); return; }
    if (aiData?.icebreaker) setInputText(aiData.icebreaker);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-CM', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="px-2 pt-10 pb-3 bg-slate-900 border-b border-white/5 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-1">
          <button onClick={onBack} className={`p-2 hover:bg-white/5 rounded-full ${accent}`}>
            <ChevronLeft className="w-7 h-7" />
          </button>
          <div className="relative">
            <img src={matchProfile.imageUrl} alt={matchProfile.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="ml-2">
            <h3 className="font-bold text-white text-base leading-tight">{matchProfile.name}</h3>
            <p className="text-xs text-green-400 font-medium">
              {isTyping ? 'typing...' : 'Active now'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 pr-1">
          <button className="p-2 rounded-full bg-slate-800 text-slate-400">
            <Shield className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowOptions(v => !v)}
              className="p-2 rounded-full text-slate-400 hover:bg-white/5"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-10 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 w-40"
                >
                  <button
                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                    onClick={() => { setShowReportConfirm(true); setShowOptions(false); }}
                  >
                    <Flag className="w-4 h-4 text-yellow-500" /> Report
                  </button>
                  <button
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                    onClick={() => { setShowOptions(false); onBack(); }}
                  >
                    <UserX className="w-4 h-4" /> Unmatch
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Report Confirm */}
      <AnimatePresence>
        {showReportConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between"
          >
            <p className="text-xs text-yellow-300">Report {matchProfile.name} for inappropriate behavior?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowReportConfirm(false)} className="text-xs text-slate-400 font-bold">Cancel</button>
              <button onClick={() => { setShowReportConfirm(false); onBack(); }} className="text-xs text-red-400 font-bold">Report &amp; Block</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        <div className="text-center text-xs text-slate-500 my-3 font-medium uppercase tracking-wide">
          You matched with {matchProfile.name} 🎉
        </div>

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
          >
            {msg.sender === 'match' && (
              <img src={matchProfile.imageUrl} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1" />
            )}
            <div className="flex flex-col gap-0.5">
              <div
                className={`max-w-[72vw] px-4 py-2.5 text-[14.5px] leading-relaxed ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-[20px] rounded-br-[4px]'
                    : 'bg-slate-800 text-white rounded-[20px] rounded-bl-[4px] border border-slate-700/50'
                  }`}
              >
                {msg.text}
              </div>
              <p className={`text-[10px] text-slate-600 ${msg.sender === 'user' ? 'text-right' : 'text-left'} px-1`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-end gap-2 justify-start"
            >
              <img src={matchProfile.imageUrl} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div className="bg-slate-800 border border-slate-700/50 rounded-[20px] rounded-bl-[4px] px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icebreaker Suggestion */}
        {messages.length < 3 && !isTyping && (
          <div className="flex justify-center mt-4">
            <button
              onClick={useIcebreaker}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              {isPaid ? 'Generate Icebreaker' : 'Unlock Magic Icebreaker'}
              {!isPaid && <Lock className="w-3 h-3 ml-1" />}
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-white/5 flex gap-2 items-end pb-7">
        <div className="flex-1 bg-slate-800 rounded-[24px] flex items-center border border-transparent focus-within:border-rose-500/50 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 bg-transparent border-none px-4 py-3 text-white focus:outline-none placeholder:text-slate-500 text-[15px]"
          />
        </div>
        <motion.button
          onClick={handleSend}
          disabled={!inputText.trim()}
          whileTap={{ scale: inputText.trim() ? 0.9 : 1 }}
          className={`p-3 rounded-full transition-all ${inputText.trim()
              ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-900/40'
              : 'bg-slate-800 text-slate-500'
            }`}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWindow;
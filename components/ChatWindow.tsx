import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, AICompatibilityResult, ChatMessage, Theme } from '../types';
import { Send, Lock, Sparkles, ChevronLeft, MoreVertical, Shield, Flag, UserX, Smile, Mic, Check, CheckCheck } from 'lucide-react';
import { sendMessage as fbSendMessage, subscribeToMessages, MessageRow, reportUser, blockUser } from '../services/firebaseService';
import { serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebaseApp';
import { auth } from '../services/firebaseApp';

interface ChatWindowProps {
  matchProfile: UserProfile;
  aiData: AICompatibilityResult | null;
  subscriptionTier: string;
  currentUserId: string;
  matchId: string; // deterministic: sorted(currentUserId, matchProfile.id).join('_')
  onUnlockClick: () => void;
  onBack: () => void;
  theme: Theme;
}

// Simulated match replies (used when Firebase not configured)
const MATCH_REPLIES: string[] = [
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
  "I love that about you 🌟",
  "Tell me your favourite spot in Cameroon!",
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  matchProfile, aiData, subscriptionTier, currentUserId, matchId,
  onUnlockClick, onBack, theme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [reported, setReported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isPaid = subscriptionTier !== 'free';
  const accent = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
  const firebaseReady = isFirebaseConfigured();

  // ── Load history + real-time subscription ──────────────────────────────────
  useEffect(() => {
    // Initial greeting from match (always shown)
    const greeting: ChatMessage = {
      id: 'greeting',
      sender: 'match',
      text: `Hey! I noticed we both like ${matchProfile.interests[0] || 'the same things'} 😊`,
      timestamp: new Date(),
      isRead: true,
    };

    if (!firebaseReady) {
      setMessages([greeting]);
      return;
    }

    setMessages([greeting]);

    // Subscribe for real-time updates
    const unsub = subscribeToMessages(matchId, (row: MessageRow) => {
      // Only add messages NOT from a simulated match (sender_id !== matchProfile.id for simulations)
      const incoming: ChatMessage = {
        id: row.id,
        sender: row.sender_id === currentUserId ? 'user' : 'match',
        text: row.text,
        timestamp: new Date(row.created_at),
        isRead: row.is_read,
      };
      setMessages(prev => {
        if (prev.some(m => m.id === row.id)) return prev;
        return [...prev, incoming];
      });
    });

    return unsub;
  }, [matchId, matchProfile.id, currentUserId, firebaseReady]);

  // ── Auto scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Simulate match reply (when Firebase not configured) ────────────────────
  const simulateReply = useCallback(() => {
    const delay = 800 + Math.random() * 1500;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: ChatMessage = {
        id: Date.now().toString(),
        sender: 'match',
        text: MATCH_REPLIES[Math.floor(Math.random() * MATCH_REPLIES.length)],
        timestamp: new Date(),
        isRead: false,
      };
      setMessages(prev => [...prev, reply]);
    }, delay);
  }, []);

  // ── Freemium: free users limited to 5 messages ─────────────────────────────
  const userMessageCount = messages.filter(m => m.sender === 'user').length;
  const hitFreeLimit = !isPaid && userMessageCount >= 5;

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return;
    if (hitFreeLimit) { onUnlockClick(); return; }

    const text = inputText.trim();
    setInputText('');

    // Optimistic local message
    const local: ChatMessage = {
      id: `local_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, local]);

    if (firebaseReady) {
      await fbSendMessage(matchId, currentUserId, text);
    } else {
      // Simulate reply in dev mode
      setTimeout(() => simulateReply(), 300);
    }
  }, [inputText, hitFreeLimit, firebaseReady, matchId, currentUserId, simulateReply, onUnlockClick]);

  // ── AI Icebreaker ──────────────────────────────────────────────────────────
  const useIcebreaker = () => {
    if (!isPaid) { onUnlockClick(); return; }
    if (aiData?.icebreaker) setInputText(aiData.icebreaker);
  };

  // ── Report / Block ─────────────────────────────────────────────────────────
  const handleReport = async () => {
    if (firebaseReady && auth.currentUser) {
      try {
        await reportUser(currentUserId, matchProfile.id, 'Inappropriate behavior');
        await blockUser(currentUserId, matchProfile.id);
      } catch { /* non-blocking */ }
    }
    setReported(true);
    setShowReportConfirm(false);
    setTimeout(() => onBack(), 1500);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-CM', { hour: '2-digit', minute: '2-digit', hour12: true });

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
              {isTyping ? 'typing...' : (matchProfile.lastActive || 'Active now')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 pr-1">
          <button className="p-2 rounded-full bg-slate-800 text-slate-400">
            <Shield className="w-4 h-4" />
          </button>
          <div className="relative">
            <button onClick={() => setShowOptions(v => !v)} className="p-2 rounded-full text-slate-400 hover:bg-white/5">
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
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

      {/* Report Banner */}
      <AnimatePresence>
        {showReportConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between"
          >
            <p className="text-xs text-yellow-300">Report {matchProfile.name} for inappropriate behavior?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowReportConfirm(false)} className="text-xs text-slate-400 font-bold">Cancel</button>
              <button onClick={handleReport} className="text-xs text-red-400 font-bold">Report &amp; Block</button>
            </div>
          </motion.div>
        )}
        {reported && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center text-xs text-green-400 font-bold">
            Reported. Returning to matches...
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
              <div className={`max-w-[72vw] px-4 py-2.5 text-[14.5px] leading-relaxed ${msg.sender === 'user'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-[20px] rounded-br-[4px]'
                : 'bg-slate-800 text-white rounded-[20px] rounded-bl-[4px] border border-slate-700/50'}`}
              >
                {msg.text}
              </div>
              <div className={`flex items-center gap-1 mt-0.5 px-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                {msg.sender === 'user' && (
                  msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3 text-slate-500" />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="flex items-end gap-2 justify-start">
              <img src={matchProfile.imageUrl} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div className="bg-slate-800 border border-slate-700/50 rounded-[20px] rounded-bl-[4px] px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                      animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Freemium Lock Banner */}
        {hitFreeLimit && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-2 p-4 bg-gradient-to-r from-rose-600/20 to-orange-500/10 border border-rose-500/30 rounded-2xl text-center"
          >
            <Lock className="w-5 h-5 text-rose-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white mb-1">You've used 5 free messages</p>
            <p className="text-xs text-slate-400 mb-3">Upgrade to keep the conversation going unlimited.</p>
            <button onClick={onUnlockClick} className="px-6 py-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-sm">
              Get Amoura+
            </button>
          </motion.div>
        )}

        {/* Icebreaker Suggestion */}
        {messages.length < 4 && !isTyping && (
          <div className="flex justify-center mt-4">
            <button onClick={useIcebreaker}
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

      {/* Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-white/5 flex gap-2 items-end pb-7">
        <div className={`flex-1 bg-slate-800 rounded-[24px] flex items-center border transition-colors ${hitFreeLimit ? 'opacity-50 border-transparent' : 'border-transparent focus-within:border-rose-500/50'} pl-2`}>
          <button className="p-2 text-slate-400 hover:text-rose-400 transition-colors" disabled={hitFreeLimit}>
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={hitFreeLimit ? 'Upgrade to send more messages...' : 'Type a message...'}
            disabled={hitFreeLimit}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 bg-transparent border-none py-3 text-white focus:outline-none placeholder:text-slate-500 text-[15px] disabled:cursor-not-allowed"
          />
          {!inputText.trim() && (
            <button className="p-2 text-slate-400 hover:text-rose-400 transition-colors mr-1" disabled={hitFreeLimit}>
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
        <motion.button
          onClick={hitFreeLimit ? onUnlockClick : handleSend}
          disabled={!inputText.trim() && !hitFreeLimit}
          whileTap={{ scale: (inputText.trim() || hitFreeLimit) ? 0.9 : 1 }}
          className={`p-3 rounded-full transition-all ${inputText.trim()
            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-900/40'
            : hitFreeLimit
              ? 'bg-rose-600/30 text-rose-400'
              : 'bg-slate-800 text-slate-500'}`}
        >
          {hitFreeLimit ? <Lock className="w-5 h-5" /> : <Send className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWindow;
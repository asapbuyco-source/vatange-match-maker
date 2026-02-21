import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MessageCircle, User } from 'lucide-react';
import { Theme } from '../types';

interface BottomNavProps {
  activeTab: 'discover' | 'matches' | 'profile';
  onTabChange: (tab: 'discover' | 'matches' | 'profile') => void;
  badgeCount?: number;
  theme: Theme;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, badgeCount = 0, theme }) => {
  const activeColor = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
  const activeBg = theme === 'royal' ? 'bg-gold-500/10' : 'bg-rose-500/10';

  const tabs: { id: 'discover' | 'matches' | 'profile'; icon: React.ReactNode; label: string }[] = [
    { id: 'discover', icon: <Compass className="w-6 h-6" />, label: 'Discover' },
    { id: 'matches', icon: <MessageCircle className="w-6 h-6" />, label: 'Matches' },
    { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-xl border-t border-white/5 pb-6 pt-2 px-4 flex justify-around items-center">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center gap-1 w-20 py-1"
          >
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`relative p-2 rounded-2xl transition-all ${isActive ? `${activeColor} ${activeBg}` : 'text-slate-600'}`}
            >
              {tab.icon}
              {tab.id === 'matches' && badgeCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-black text-[10px] font-black text-white flex items-center justify-center px-0.5"
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </motion.span>
              )}
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors ${isActive ? activeColor : 'text-slate-600'}`}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
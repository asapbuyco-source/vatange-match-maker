import React from 'react';
import { Compass, MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activeTab: 'discover' | 'matches' | 'profile';
  onTabChange: (tab: 'discover' | 'matches' | 'profile') => void;
  badgeCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, badgeCount = 0 }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none flex justify-center">
      <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 shadow-2xl flex items-center gap-8 shadow-black/50">
        
        <NavButton 
          isActive={activeTab === 'discover'} 
          onClick={() => onTabChange('discover')}
          icon={<Compass className="w-6 h-6" />}
          label="Discover"
        />

        <div className="w-[1px] h-8 bg-white/10" />

        <NavButton 
          isActive={activeTab === 'matches'} 
          onClick={() => onTabChange('matches')}
          icon={<MessageCircle className="w-6 h-6" />}
          label="Matches"
          badge={badgeCount}
        />

        <div className="w-[1px] h-8 bg-white/10" />

        <NavButton 
          isActive={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')}
          icon={<User className="w-6 h-6" />}
          label="Profile"
        />
        
      </div>
    </div>
  );
};

const NavButton = ({ isActive, onClick, icon, label, badge }: any) => (
  <button 
    onClick={onClick}
    className="relative flex flex-col items-center gap-1 group"
  >
    <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'text-gold-400 bg-gold-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon}
    </div>
    {isActive && (
      <motion.div 
        layoutId="nav-dot"
        className="absolute -bottom-1 w-1 h-1 bg-gold-500 rounded-full"
      />
    )}
    {badge > 0 && (
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
    )}
  </button>
);

export default BottomNav;
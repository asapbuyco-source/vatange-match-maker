import React from 'react';
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

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-t border-white/5 pt-2 pb-6 px-6 flex justify-around items-center">
        
        <NavButton 
          isActive={activeTab === 'discover'} 
          onClick={() => onTabChange('discover')}
          icon={<Compass className="w-6 h-6" />}
          label="Discover"
          activeColor={activeColor}
        />

        <NavButton 
          isActive={activeTab === 'matches'} 
          onClick={() => onTabChange('matches')}
          icon={<MessageCircle className="w-6 h-6" />}
          label="Matches"
          badge={badgeCount}
          activeColor={activeColor}
        />

        <NavButton 
          isActive={activeTab === 'profile'} 
          onClick={() => onTabChange('profile')}
          icon={<User className="w-6 h-6" />}
          label="Profile"
          activeColor={activeColor}
        />
        
    </div>
  );
};

const NavButton = ({ isActive, onClick, icon, label, badge, activeColor }: any) => (
  <button 
    onClick={onClick}
    className="relative flex flex-col items-center gap-1 group w-16"
  >
    <div className={`p-1 transition-all duration-200 ${isActive ? `${activeColor} scale-110` : 'text-slate-600 hover:text-slate-400'}`}>
      {icon}
    </div>
    {badge > 0 && (
      <span className="absolute top-0 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#111]" />
    )}
  </button>
);

export default BottomNav;
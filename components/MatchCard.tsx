import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { UserProfile, AICompatibilityResult, Theme } from '../types';
import { Sparkles, Briefcase, Info } from 'lucide-react';

interface MatchCardProps {
  profile: UserProfile;
  aiData: AICompatibilityResult | null;
  aiLoading: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  direction?: 'left' | 'right' | null;
  theme: Theme;
}

const MatchCard: React.FC<MatchCardProps> = ({ profile, aiData, aiLoading, onSwipe, direction, theme }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Theme Variables
  const badgeBg = theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500';

  // Visual indicators (Stamps)
  const likeOpacity = useTransform(x, [20, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);
  const likeScale = useTransform(x, [20, 150], [0.5, 1]);
  const nopeScale = useTransform(x, [-20, -150], [0.5, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
  };

  // Determine exit animation based on direction prop (for button clicks) or standard fallback
  const exitX = direction === 'right' ? 500 : direction === 'left' ? -500 : 0;
  const exitRot = direction === 'right' ? 15 : direction === 'left' ? -15 : 0;

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="group absolute inset-0 w-full h-full rounded-[24px] overflow-hidden shadow-2xl bg-black cursor-grab active:cursor-grabbing z-20 origin-bottom"
      initial={{ scale: 0.95, opacity: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: exitX, rotate: exitRot, opacity: 0, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Full Background Image */}
      <div className="absolute inset-0 select-none">
        <img 
          src={profile.imageUrl} 
          alt={profile.name} 
          className="w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-in-out group-hover:scale-110"
          draggable={false}
        />
        
        {/* Improved Gradients for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Swipe Stamps */}
      <motion.div style={{ opacity: likeOpacity, scale: likeScale }} className="absolute top-12 left-8 border-4 border-[#4CD964] rounded-lg px-4 py-1 transform -rotate-12 z-30 shadow-lg bg-black/10 backdrop-blur-sm">
        <span className="text-[#4CD964] font-bold text-4xl uppercase tracking-widest" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Like</span>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity, scale: nopeScale }} className="absolute top-12 right-8 border-4 border-[#FF3B30] rounded-lg px-4 py-1 transform rotate-12 z-30 shadow-lg bg-black/10 backdrop-blur-sm">
        <span className="text-[#FF3B30] font-bold text-4xl uppercase tracking-widest" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Nope</span>
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-5 z-20 text-white flex flex-col justify-end pb-44">
        
        {/* AI Insight Badge */}
        {!aiLoading && aiData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start mb-2"
          >
            <div className={`flex items-center gap-1.5 backdrop-blur-md rounded-full px-3 py-1 shadow-lg ${badgeBg} border border-white/10`}>
              <Sparkles className="w-3 h-3 text-white fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                {aiData.score}% Match
              </span>
            </div>
          </motion.div>
        )}

        {/* Name and Age + Info Icon Row */}
        <div className="flex justify-between items-end mb-1.5 pr-2">
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-lg leading-none">{profile.name}</h2>
              <span className="text-2xl font-medium opacity-95 drop-shadow-md mb-0.5">{profile.age}</span>
            </div>
            
            <button className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/30 hover:scale-110 transition-transform shadow-lg">
               <Info className="w-5 h-5 text-white" />
            </button>
        </div>

        {/* Job Title */}
        <div className="flex items-center gap-2 text-base font-medium opacity-90 drop-shadow-md mb-3 text-slate-100">
          <Briefcase className="w-4 h-4" />
          <span>{profile.job}</span>
        </div>

        {/* Interests Pills */}
        <div className="flex flex-wrap gap-2 mb-2">
          {profile.interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/10 shadow-sm text-white">
              {interest}
            </span>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
            <p className="text-sm text-slate-200/90 line-clamp-2 leading-relaxed drop-shadow-md font-normal max-w-[95%]">
            {profile.bio}
            </p>
        )}
      </div>
    </motion.div>
  );
};

export default MatchCard;
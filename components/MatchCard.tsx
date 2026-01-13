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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Theme Variables
  const badgeBg = theme === 'royal' ? 'bg-gold-500/20' : 'bg-rose-500/20';
  const badgeBorder = theme === 'royal' ? 'border-gold-500/50' : 'border-rose-500/50';
  const badgeText = theme === 'royal' ? 'text-gold-300' : 'text-rose-300';
  const iconColor = theme === 'royal' ? 'text-gold-400' : 'text-rose-400';

  // Visual indicators (Stamps)
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

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
  const exitRot = direction === 'right' ? 20 : direction === 'left' ? -20 : 0;

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 cursor-grab active:cursor-grabbing z-20 origin-bottom"
      initial={{ scale: 0.95, opacity: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: exitX, rotate: exitRot, opacity: 0, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Full Background Image */}
      <div className="absolute inset-0 select-none">
        <img 
          src={profile.imageUrl} 
          alt={profile.name} 
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Swipe Stamps */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 rounded-lg px-4 py-2 transform -rotate-12 z-30">
        <span className="text-green-500 font-bold text-4xl uppercase tracking-widest">Like</span>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-12 z-30">
        <span className="text-red-500 font-bold text-4xl uppercase tracking-widest">Nope</span>
      </motion.div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white flex flex-col gap-2 pb-24">
        
        {/* AI Insight Badge */}
        {!aiLoading && aiData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start mb-2"
          >
            <div className={`flex items-center gap-2 backdrop-blur-md border rounded-full px-3 py-1.5 shadow-lg shadow-black/20 ${badgeBg} ${badgeBorder}`}>
              <Sparkles className={`w-3.5 h-3.5 ${iconColor}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${badgeText}`}>
                {aiData.score}% Compatible
              </span>
            </div>
          </motion.div>
        )}

        <div className="flex items-end gap-3">
          <h2 className="text-4xl font-bold drop-shadow-lg">{profile.name}</h2>
          <span className="text-2xl font-medium opacity-90 mb-1">{profile.age}</span>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium opacity-80 mb-2">
          <Briefcase className="w-4 h-4" />
          <span>{profile.job}</span>
        </div>

        {/* Interests Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium backdrop-blur-sm border border-white/5">
              {interest}
            </span>
          ))}
        </div>

        {/* Bio or AI Insight */}
        <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed opacity-90 drop-shadow-md">
           {aiData?.insight || profile.bio}
        </p>

        <button className="absolute bottom-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Info className="w-6 h-6 text-white" />
        </button>
      </div>
    </motion.div>
  );
};

export default MatchCard;
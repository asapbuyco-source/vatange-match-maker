import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { UserProfile, AICompatibilityResult } from '../types';
import { Sparkles, Check, X, BrainCircuit, Info } from 'lucide-react';

interface MatchCardProps {
  profile: UserProfile;
  aiData: AICompatibilityResult | null;
  aiLoading: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ profile, aiData, aiLoading, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Visual indicators
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute top-0 w-full max-w-[90%] md:max-w-sm h-[68vh] rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] bg-slate-900 border border-white/10 cursor-grab active:cursor-grabbing flex flex-col z-20"
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      {/* Image Section */}
      <div className="relative flex-1 w-full bg-slate-900 group">
        <img 
          src={profile.imageUrl} 
          alt={profile.name} 
          className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-royal-900 via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
        
        {/* Swipe Overlays */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 bg-green-500/20 backdrop-blur-md border border-green-400 rounded-full px-6 py-2 transform -rotate-6 shadow-xl">
          <span className="text-green-400 font-serif font-bold text-2xl tracking-widest">YES</span>
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 bg-red-500/20 backdrop-blur-md border border-red-500 rounded-full px-6 py-2 transform rotate-6 shadow-xl">
          <span className="text-red-500 font-serif font-bold text-2xl tracking-widest">NO</span>
        </motion.div>

        {/* Name Info */}
        <div className="absolute bottom-6 left-6 text-white z-10">
          <h2 className="text-4xl font-serif font-bold text-white drop-shadow-md mb-1">
            {profile.name}, <span className="text-gold-400 font-light">{profile.age}</span>
          </h2>
          <p className="text-slate-200 text-sm font-medium tracking-wide uppercase opacity-90 flex items-center gap-2">
             {profile.job}
          </p>
        </div>
      </div>

      {/* Vantage AI Panel */}
      <div className="relative h-[32%] bg-gradient-to-b from-royal-900 to-black p-6 flex flex-col justify-between border-t border-white/5">
        
        {/* AI Score Header */}
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-gold-500/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-gold-400" />
             </div>
             <span className="text-xs font-bold tracking-[0.15em] text-gold-500 uppercase">Compatibility</span>
          </div>
          <div className="flex items-baseline gap-1">
             {aiLoading ? (
               <div className="h-6 w-12 bg-white/10 rounded animate-pulse" />
             ) : (
               <>
                 <span className="text-4xl font-serif font-bold text-white">{aiData?.score}</span>
                 <span className="text-sm text-slate-500">%</span>
               </>
             )}
          </div>
        </div>

        {/* Insight Text */}
        <div className="relative bg-white/5 rounded-2xl p-4 border border-white/5">
           {aiLoading ? (
             <div className="space-y-2">
               <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse" />
               <div className="h-2 bg-white/10 rounded w-1/2 animate-pulse delay-75" />
             </div>
           ) : (
             <p className="text-sm text-slate-300 font-serif italic leading-relaxed line-clamp-2">
               "{aiData?.insight}"
             </p>
           )}
        </div>

        {/* Action Buttons */}
        <div className="absolute -top-8 right-6 flex gap-4">
          <button 
            onClick={() => onSwipe('left')}
            className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 text-red-500 shadow-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={() => onSwipe('right')}
            className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 text-green-500 shadow-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all hover:scale-110 active:scale-95"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
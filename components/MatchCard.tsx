import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { UserProfile, AICompatibilityResult, Theme, RELATIONSHIP_GOALS } from '../types';
import { Sparkles, Briefcase, Info, MapPin, CheckCircle, GraduationCap } from 'lucide-react';

interface MatchCardProps {
  profile: UserProfile;
  aiData: AICompatibilityResult | null;
  aiLoading: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  onInfoClick: () => void;
  direction?: 'left' | 'right' | null;
  theme: Theme;
}

const MatchCard: React.FC<MatchCardProps> = ({ profile, aiData, aiLoading, onSwipe, onInfoClick, direction, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.4, 1, 1, 1, 0.4]);

  // Badge theme
  const badgeBg = theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500';

  // Stamp indicators
  const likeOpacity = useTransform(x, [30, 160], [0, 1]);
  const nopeOpacity = useTransform(x, [-30, -160], [0, 1]);
  const likeScale = useTransform(x, [30, 160], [0.6, 1]);
  const nopeScale = useTransform(x, [-30, -160], [0.6, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 90;
    const velocityThreshold = 500;
    const isFlick = Math.abs(info.velocity.x) > velocityThreshold;
    if (info.offset.x > swipeThreshold || (isFlick && info.velocity.x > 0)) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold || (isFlick && info.velocity.x < 0)) {
      onSwipe('left');
    }
  };

  const exitX = direction === 'right' ? 600 : direction === 'left' ? -600 : 0;
  const exitRot = direction === 'right' ? 20 : direction === 'left' ? -20 : 0;

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className="group absolute inset-0 w-full h-full rounded-[28px] overflow-hidden shadow-2xl bg-black cursor-grab active:cursor-grabbing z-20 origin-bottom select-none"
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, rotate: exitRot, opacity: 0, transition: { duration: 0.28 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 select-none pointer-events-none">
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      </div>

      {/* Swipe Stamps */}
      <motion.div
        style={{ opacity: likeOpacity, scale: likeScale }}
        className="absolute top-14 left-6 border-[3px] border-[#FF4B6E] rounded-xl px-4 py-1 -rotate-12 z-30 shadow-2xl"
      >
        <span className="text-[#FF4B6E] font-black text-4xl uppercase tracking-widest drop-shadow">LIKE</span>
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity, scale: nopeScale }}
        className="absolute top-14 right-6 border-[3px] border-[#CFCFCF] rounded-xl px-4 py-1 rotate-12 z-30 shadow-2xl"
      >
        <span className="text-[#CFCFCF] font-black text-4xl uppercase tracking-widest drop-shadow">PASS</span>
      </motion.div>

      {/* AI Skeleton Loader */}
      {aiLoading && (
        <div className="absolute top-14 left-5 z-20">
          <div className="w-28 h-6 rounded-full shimmer bg-white/10" />
        </div>
      )}

      {/* AI Badge */}
      {!aiLoading && aiData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-14 left-5 z-20"
        >
          <div className={`flex items-center gap-1.5 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg ${badgeBg} border border-white/15`}>
            <Sparkles className="w-3 h-3 text-white fill-current" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              {aiData.score}% Match
            </span>
          </div>
        </motion.div>
      )}

      {/* Verified Badge */}
      {profile.verified && (
        <div className="absolute top-14 right-5 z-20">
          <div className="flex items-center gap-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-2 py-1">
            <CheckCircle className="w-3 h-3 text-blue-400 fill-current" />
            <span className="text-[10px] font-bold text-blue-300">Verified</span>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-5 z-20 text-white flex flex-col justify-end pb-44">

        {/* Name Row */}
        <div className="flex justify-between items-end mb-1.5 pr-1">
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black tracking-tight leading-none drop-shadow-xl">{profile.name}</h2>
            <span className="text-2xl font-semibold opacity-90 mb-0.5">{profile.age}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
            className="p-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/25 active:scale-90 transition-all shadow-lg"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Job & Location */}
        <div className="flex items-center flex-wrap gap-3 text-sm font-medium opacity-90 mb-2 text-slate-100">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{profile.job}</span>
          </div>
          {profile.university && (
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{profile.university}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{profile.location}</span>
              {profile.distance !== undefined && <span className="text-slate-400">· {profile.distance} km</span>}
            </div>
          )}
        </div>

        {profile.relationship_goal && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-[10px] font-bold text-white mb-2 max-w-fit">
            <span>{RELATIONSHIP_GOALS.find(g => g.value === profile.relationship_goal)?.emoji}</span>
            <span>{RELATIONSHIP_GOALS.find(g => g.value === profile.relationship_goal)?.label}</span>
          </div>
        )}

        {/* Interests */}
        <div className="flex flex-wrap gap-2 mb-2.5">
          {profile.interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/12 text-xs font-semibold backdrop-blur-md border border-white/10 shadow-sm">
              {interest}
            </span>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <motion.div>
            <p
              className={`text-sm text-slate-200/95 leading-relaxed font-normal max-w-[95%] drop-shadow ${expanded ? '' : 'line-clamp-2'}`}
              onClick={() => setExpanded(v => !v)}
            >
              {profile.bio}
            </p>
            {profile.bio.length > 80 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-xs text-slate-400 mt-1 font-semibold"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MatchCard;
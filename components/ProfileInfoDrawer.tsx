import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, Sparkles, Heart, Shield, CheckCircle } from 'lucide-react';
import { UserProfile, AICompatibilityResult, Theme } from '../types';

interface ProfileInfoDrawerProps {
    profile: UserProfile;
    aiData: AICompatibilityResult | null;
    isOpen: boolean;
    onClose: () => void;
    onSuperLike: () => void;
    onLike: () => void;
    onNope: () => void;
    theme: Theme;
}

const ProfileInfoDrawer: React.FC<ProfileInfoDrawerProps> = ({
    profile, aiData, isOpen, onClose, onSuperLike, onLike, onNope, theme
}) => {
    const accent = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
    const accentBg = theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="absolute bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-[32px] overflow-hidden max-h-[85%] flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1 rounded-full bg-slate-700" />
                        </div>

                        <div className="overflow-y-auto scrollbar-hide flex-1">
                            {/* Header */}
                            <div className="relative">
                                <img
                                    src={profile.imageUrl}
                                    alt={profile.name}
                                    className="w-full h-56 object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-4 left-5">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-bold text-white">
                                            {profile.name}, {profile.age}
                                        </h2>
                                        {profile.verified && (
                                            <CheckCircle className="w-5 h-5 text-blue-400 fill-current" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-slate-300 text-sm">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        <span>{profile.job}</span>
                                        {profile.location && (
                                            <>
                                                <span className="text-slate-600">·</span>
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{profile.location}</span>
                                            </>
                                        )}
                                    </div>
                                    {profile.distance !== undefined && (
                                        <p className="text-xs text-slate-400 mt-0.5">{profile.distance} km away</p>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-5 pt-4 pb-6 space-y-5">

                                {/* AI Compatibility */}
                                {aiData && (
                                    <div className={`p-4 rounded-2xl border ${theme === 'royal' ? 'border-gold-500/20 bg-gold-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className={`w-4 h-4 ${accent}`} />
                                                <span className={`text-sm font-bold ${accent}`}>AI Compatibility</span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full ${accentBg} text-white text-sm font-bold`}>
                                                {aiData.score}%
                                            </div>
                                        </div>
                                        {/* Score bar */}
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${aiData.score}%` }}
                                                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${accentBg}`}
                                            />
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed italic">"{aiData.insight}"</p>
                                    </div>
                                )}

                                {/* Bio */}
                                {profile.bio && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">About</h3>
                                        <p className="text-slate-200 leading-relaxed">{profile.bio}</p>
                                    </div>
                                )}

                                {/* Interests */}
                                {profile.interests.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.interests.map((interest, i) => (
                                                <span
                                                    key={i}
                                                    className="px-4 py-2 rounded-full text-sm font-semibold bg-white/8 border border-white/10 text-white"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Safety Note */}
                                <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-white/5">
                                    <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <p className="text-xs text-slate-400">Always meet in a safe, public place. Report suspicious behavior.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 border-t border-white/5 bg-slate-950 flex gap-3">
                            <button
                                onClick={() => { onNope(); onClose(); }}
                                className="flex-1 py-3.5 rounded-2xl border-2 border-red-500/30 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                            >
                                <X className="w-5 h-5" /> Pass
                            </button>
                            <button
                                onClick={() => { onSuperLike(); onClose(); }}
                                className="px-5 py-3.5 rounded-2xl border-2 border-blue-500/30 text-blue-400 font-bold flex items-center justify-center hover:bg-blue-500/10 transition-colors"
                            >
                                <Sparkles className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => { onLike(); onClose(); }}
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold flex items-center justify-center gap-2"
                            >
                                <Heart className="w-5 h-5 fill-current" /> Like
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfileInfoDrawer;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, CheckCircle, Share2 } from 'lucide-react';
import { ReferralState } from '../types';

interface ReferralSystemProps {
    referralState: ReferralState;
}

const ReferralSystem: React.FC<ReferralSystemProps> = ({ referralState }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://amoura.cm/i/${referralState.referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join me on Amoura!',
                text: 'Join me on Amoura, the best dating app in Cameroon. Use my code to get started!',
                url: `https://amoura.cm/i/${referralState.referralCode}`,
            });
        } else {
            handleCopy();
        }
    };

    const progress = Math.min((referralState.invitesAccepted / 3) * 100, 100);

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden mt-6 text-left">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF4B6E]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFD166]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#FF4B6E]/20 flex items-center justify-center flex-shrink-0 border border-[#FF4B6E]/30">
                    <Gift className="w-6 h-6 text-[#FF4B6E]" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">Invite Friends,<br />Get Amoura+ Free</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Invite 3 friends to join Amoura and unlock 7 days of premium features automatically.
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6 relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Progress</span>
                    <span className="text-sm font-black text-white">{referralState.invitesAccepted} / 3 <span className="text-slate-500 font-medium">Invites</span></span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#FF4B6E] to-[#FFD166] rounded-full"
                    />
                </div>
                {referralState.invitesAccepted >= 3 && (
                    <p className="text-green-400 text-xs font-bold mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Amoura+ unlocked for 7 days!
                    </p>
                )}
            </div>

            {/* Code Link */}
            <div className="bg-slate-950 border border-white/10 rounded-2xl p-2 pl-4 flex items-center justify-between mb-4 relative z-10 shadow-inner">
                <span className="text-white font-mono opacity-80 truncate text-sm">
                    amoura.cm/i/{referralState.referralCode}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                    {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>

            <button
                onClick={handleShare}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#FF4B6E] text-white hover:bg-[#E63E5C] transition-colors relative z-10 shadow-lg shadow-[#FF4B6E]/20"
            >
                <Share2 className="w-4 h-4" /> Share Invite Link
            </button>
        </div>
    );
};

export default ReferralSystem;

import React from 'react';
import { motion } from 'framer-motion';

interface GamePadButtonProps {
    icon: React.ReactNode;
    className?: string;
    size?: 'small' | 'large';
    onClick: () => void;
    fill?: boolean;
    disabled?: boolean;
    label?: string;
}

const GamePadButton: React.FC<GamePadButtonProps> = ({
    icon, className = '', size = 'small', onClick, fill = false, disabled = false, label
}) => {
    const isLarge = size === 'large';
    return (
        <div className="flex flex-col items-center gap-1">
            <motion.button
                onClick={onClick}
                disabled={disabled}
                whileHover={{ scale: disabled ? 1 : 1.12 }}
                whileTap={{ scale: disabled ? 1 : 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`
          ${isLarge ? 'w-16 h-16' : 'w-12 h-12'}
          rounded-full border-2 flex items-center justify-center
          shadow-xl backdrop-blur-sm
          transition-opacity duration-200
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
            >
                <div className={fill ? 'fill-current' : ''}>
                    {icon}
                </div>
            </motion.button>
            {label && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{label}</span>}
        </div>
    );
};

export default GamePadButton;

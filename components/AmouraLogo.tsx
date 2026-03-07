import React from 'react';

interface AmouraLogoProps {
    size?: number | string;
    className?: string;
    /** Show text "Amoura" beside the logo */
    showText?: boolean;
    textClassName?: string;
}

/**
 * Amoura Logo — Two curved shapes forming a heart,
 * representing two people connecting.
 * Uses the primary coral-red brand color #FF4B6E.
 */
const AmouraLogo: React.FC<AmouraLogoProps> = ({
    size = 40,
    className = '',
    showText = false,
    textClassName = '',
}) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Logo image provided by user */}
            <img
                src="https://i.ibb.co/xSL3Rr7h/Chat-GPT-Image-Mar-7-2026-02-59-34-AM.png"
                alt="Amoura Logo"
                width={size}
                height={size}
                style={{ width: size, height: size, objectFit: 'contain' }}
                className="rounded-lg"
            />
            {showText && (
                <span
                    className={`font-serif font-bold tracking-tight text-[#FF4B6E] ${textClassName}`}
                    style={{ lineHeight: 1 }}
                >
                    Amoura
                </span>
            )}
        </div>
    );
};

/** Inline SVG heart fallback if image fails to load */
export const AmouraLogoSVG: React.FC<{ size?: number; color?: string }> = ({
    size = 40,
    color = '#FF4B6E',
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Left half-heart curve */}
        <path
            d="M24 38C24 38 6 28 6 17C6 11.477 10.477 7 16 7C19.5 7 22.5 8.8 24 11.5"
            fill={color}
            opacity="0.9"
        />
        {/* Right half-heart curve */}
        <path
            d="M24 38C24 38 42 28 42 17C42 11.477 37.523 7 32 7C28.5 7 25.5 8.8 24 11.5"
            fill={color}
        />
        {/* Center connection dot */}
        <circle cx="24" cy="12" r="2.5" fill="white" opacity="0.8" />
    </svg>
);

export default AmouraLogo;

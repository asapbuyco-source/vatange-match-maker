/**
 * Amoura — Brand Design System
 * Central color tokens and theme utilities.
 */

export const AMOURA_COLORS = {
    /** Primary coral-red — Like action / brand primary */
    primary: '#FF4B6E',
    /** Soft pink — Secondary brand / accents */
    secondary: '#FF8FA3',
    /** App background */
    background: '#FFFFFF',
    /** Primary body text */
    text: '#1F1F1F',
    /** Light neutral backgrounds */
    neutral1: '#F5F5F7',
    /** Secondary / muted text */
    neutral2: '#A0A0A0',
    /** Headings */
    heading: '#333333',

    // ── Action Colors ──────────────────────────────────────────────────
    /** Like / swipe right */
    like: '#FF4B6E',
    /** Pass / swipe left */
    pass: '#CFCFCF',
    /** Super Like */
    superLike: '#FFD166',
    /** Chat / messaging accent */
    messaging: '#6C63FF',
} as const;

/** Tailwind class helpers for common Amoura brand actions */
export const AMOURA_CLASSES = {
    // Backgrounds
    primaryBg: 'bg-[#FF4B6E]',
    primaryBgHover: 'hover:bg-[#e04362]',
    secondaryBg: 'bg-[#FF8FA3]',
    messagingBg: 'bg-[#6C63FF]',
    superLikeBg: 'bg-[#FFD166]',

    // Text
    primaryText: 'text-[#FF4B6E]',
    secondaryText: 'text-[#FF8FA3]',
    messagingText: 'text-[#6C63FF]',

    // Gradients
    primaryGradient: 'bg-gradient-to-r from-[#FF4B6E] to-[#FF8FA3]',
    darkBgGradient: 'bg-gradient-to-b from-[#1a0008] to-[#0d0010]',

    // Borders
    primaryBorder: 'border-[#FF4B6E]',
    primaryBorderHalf: 'border-[#FF4B6E]/50',

    // Rings
    primaryRing: 'ring-[#FF4B6E]',
} as const;

export type AmouraTheme = 'amoura' | 'royal';

/** Get theme-aware accent class */
export const getAccent = (theme: AmouraTheme) =>
    theme === 'royal' ? 'text-yellow-400' : 'text-[#FF4B6E]';

export const getAccentBg = (theme: AmouraTheme) =>
    theme === 'royal' ? 'bg-yellow-500' : 'bg-[#FF4B6E]';

export const getGradientClass = (theme: AmouraTheme) =>
    theme === 'royal'
        ? 'from-yellow-600 to-yellow-400'
        : 'from-[#FF4B6E] to-[#FF8FA3]';

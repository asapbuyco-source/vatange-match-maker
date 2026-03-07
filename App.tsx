import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserProfile, Theme, FilterPreferences, SubscriptionTier, ToastMessage, SuperLikeState, ReferralState } from './types';
import { useAmouraAI } from './hooks/useAmouraAI';
import { useLanguage } from './i18n/LanguageContext';
import { DEMO_PROFILE_IMAGES } from './constants/africanImages';
import { upsertProfile, createMatch } from './services/firebaseService';
import MatchCard from './components/MatchCard';
import SubscriptionModal from './components/SubscriptionModal';
import ChatWindow from './components/ChatWindow';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import GamePadButton from './components/GamePadButton';
import ToastContainer from './components/ToastContainer';
import SettingsPanel from './components/SettingsPanel';
import EditProfilePanel from './components/EditProfilePanel';
import ProfileInfoDrawer from './components/ProfileInfoDrawer';
import AccountVerification from './components/AccountVerification';
import AmouraLogo from './components/AmouraLogo';
import ReferralSystem from './components/ReferralSystem';
import {
  Shield, RotateCcw, X, Star, Heart, Zap, Sparkles,
  Settings, Edit3, Search, CheckCircle, Lock, Crown, Globe
} from 'lucide-react';

// Cameroon-specific demo profiles — using authentic African couple imagery
const MATCH_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Amina',
    age: 24,
    job: 'Fashion Designer',
    bio: 'Passionate about Cameroonian fashion and creating looks that celebrate our culture. I love afrobeats, good food, and long conversations by the beach.',
    imageUrl: DEMO_PROFILE_IMAGES.amina,
    interests: ['Fashion', 'Art', 'Music', 'Foodie'],
    location: 'Douala',
    verified: true,
    distance: 3,
    lastActive: 'Active now',
  },
  {
    id: '2',
    name: 'Kevin',
    age: 28,
    job: 'Software Engineer',
    bio: 'Building Cameroon\'s tech future one line of code at a time. I enjoy hiking Mount Cameroon, jazz, and debating big ideas over ndolé.',
    imageUrl: DEMO_PROFILE_IMAGES.kevin,
    interests: ['Tech', 'Fitness', 'Music', 'Travel'],
    location: 'Yaoundé',
    verified: true,
    distance: 12,
    lastActive: 'Active 2h ago',
  },
  {
    id: '3',
    name: 'Grace',
    age: 25,
    job: 'Pediatric Nurse',
    bio: 'Healthcare hero by day, adventurer by weekend. I love exploring Kribi\'s beaches and discovering hidden restaurants across Cameroon.',
    imageUrl: DEMO_PROFILE_IMAGES.grace,
    interests: ['Nature', 'Travel', 'Fitness', 'Reading'],
    location: 'Kribi',
    verified: false,
    distance: 28,
    lastActive: 'Active yesterday',
  },
  {
    id: '4',
    name: 'Marcus',
    age: 30,
    job: 'Entrepreneur',
    bio: 'Running two businesses in Douala while staying grounded. Football fanatic, lover of good ndolé, and always up for a deep conversation.',
    imageUrl: DEMO_PROFILE_IMAGES.marcus,
    interests: ['Football', 'Business', 'Foodie', 'Music'],
    location: 'Douala',
    verified: true,
    distance: 7,
    lastActive: 'Active now',
  },
  {
    id: '5',
    name: 'Chloe',
    age: 22,
    job: 'Law Student',
    bio: 'Future attorney fighting for justice. I spend free time dancing, reading African literature, and dreaming of road trips across the continent.',
    imageUrl: DEMO_PROFILE_IMAGES.chloe,
    interests: ['Reading', 'Dancing', 'Travel', 'Art'],
    location: 'Bafoussam',
    verified: false,
    distance: 45,
    lastActive: 'Active 1h ago',
  },
  {
    id: '6',
    name: 'Fatima',
    age: 26,
    job: 'Architect',
    bio: 'Designing spaces that reflect African identity. Coffee lover, weekend hiker, and passionate about sustainable architecture in Cameroon.',
    imageUrl: DEMO_PROFILE_IMAGES.fatima,
    interests: ['Architecture', 'Art', 'Nature', 'Coffee'],
    location: 'Yaoundé',
    verified: true,
    distance: 5,
    lastActive: 'Active now',
  },
  {
    id: '7',
    name: 'Christian',
    age: 29,
    job: 'Music Producer',
    bio: 'Creating afrobeats that tell the story of Douala. Studio by night, beaches by day. Looking for someone who appreciates real music and real vibes.',
    imageUrl: DEMO_PROFILE_IMAGES.christian,
    interests: ['Music', 'Art', 'Travel', 'Fitness'],
    location: 'Douala',
    verified: true,
    distance: 9,
    lastActive: 'Active 30min ago',
  },
  {
    id: '8',
    name: 'Claire',
    age: 23,
    job: 'University Lecturer',
    bio: 'Teaching economics at UYI while writing my first novel. I believe the best relationships are built on laughter, respect, and great food.',
    imageUrl: DEMO_PROFILE_IMAGES.claire,
    interests: ['Reading', 'Writing', 'Foodie', 'Education'],
    location: 'Yaoundé',
    verified: false,
    distance: 18,
    lastActive: 'Active 3h ago',
  },
];

const DEFAULT_FILTERS: FilterPreferences = {
  ageMin: 18,
  ageMax: 40,
  maxDistance: 100,
  genderPreference: 'everyone',
  city: 'Douala',
};

const INITIAL_SUPER_LIKES: SuperLikeState = {
  remaining: 5,
  resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
};

const App: React.FC = () => {
  // --- i18n ---
  const { t, language, setLanguage, toggleLanguage, interpolate } = useLanguage();

  // --- Theme (persisted) ---
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('amoura_theme') as Theme) || 'rose');

  // --- Navigation ---
  const [view, setView] = useState<'landing' | 'onboarding' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile'>('discover');

  // --- Data ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profileIndex, setProfileIndex] = useState(0);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [activeChatProfile, setActiveChatProfile] = useState<UserProfile | null>(null);
  const [matchAiMap, setMatchAiMap] = useState<Record<string, { score: number; insight: string; icebreaker: string }>>({});

  // --- Action State ---
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [undoStack, setUndoStack] = useState<number[]>([]);
  const [superLikes, setSuperLikes] = useState<SuperLikeState>(INITIAL_SUPER_LIKES);

  // --- Referral & Boost ---
  const [referralState, setReferralState] = useState<ReferralState>({
    referralCode: 'AMO-9X2P',
    invitesSent: 5,
    invitesAccepted: 1,
    premiumDaysEarned: 0,
  });
  const [isBoosted, setIsBoosted] = useState(false);

  // --- Subscription ---
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [showSubscription, setShowSubscription] = useState(false);

  // --- UI Panels ---
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [filters, setFilters] = useState<FilterPreferences>(DEFAULT_FILTERS);

  // --- Toasts ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'], duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- Derived ---
  const currentProfile = useMemo(() =>
    profileIndex < MATCH_PROFILES.length ? MATCH_PROFILES[profileIndex] : null,
    [profileIndex]
  );

  const isPaid = subscriptionTier !== 'free';
  const isGoldPlus = subscriptionTier === 'gold' || subscriptionTier === 'platinum';

  // --- AI ---
  const fallbackUser = useMemo<UserProfile>(() => ({
    id: 'temp', name: 'User', age: 0, job: '', bio: '', imageUrl: '', interests: []
  }), []);

  const { data: aiData, loading: aiLoading } = useAmouraAI(currentUser ?? fallbackUser, currentProfile, language);

  // Theme helpers
  const accentColor = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
  const gradientClass = theme === 'royal' ? 'from-gold-600 to-gold-400' : 'from-rose-500 to-rose-400';

  // --- Handlers ---
  const handleToggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'royal' ? 'rose' : 'royal';
      localStorage.setItem('amoura_theme', next);
      return next;
    });
  }, []);

  const handleToggleLanguage = useCallback(() => {
    toggleLanguage();
  }, [toggleLanguage]);

  const handleOnboardingComplete = useCallback(async (profile: UserProfile) => {
    setCurrentUser(profile);
    setFilters(f => ({ ...f, city: profile.location ?? 'Douala' }));
    setView('app');

    // Persist to Firestore (non-blocking)
    upsertProfile({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      job: profile.job,
      bio: profile.bio,
      image_url: profile.imageUrl,
      interests: profile.interests,
      location: profile.location ?? 'Douala',
      gender: (profile.gender as 'male' | 'female' | 'other') || 'other',
      verified: false,
      subscription_tier: 'free',
      last_active: new Date().toISOString(),
    }).catch(err => console.warn('[App] Profile persist failed:', err));

    setTimeout(() => {
      addToast(interpolate(t.toasts.welcome, { name: profile.name }), 'success');
      // Prompt account verification 1.5s after welcome
      setTimeout(() => setShowVerification(true), 1500);
    }, 500);
  }, [addToast, t, interpolate]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentProfile) return;
    setExitDirection(direction);

    if (direction === 'right') {
      const alreadyMatched = matches.some(m => m.id === currentProfile.id);
      if (!alreadyMatched) {
        setMatches(prev => [...prev, currentProfile]);
        if (aiData) setMatchAiMap(prev => ({ ...prev, [currentProfile.id]: aiData }));
        addToast(interpolate(t.toasts.matched, { name: currentProfile.name }), 'match');
        // Persist match to Firestore
        if (currentUser) {
          const matchDocId = [currentUser.id, currentProfile.id].sort().join('_');
          createMatch(currentUser.id, matchDocId, aiData?.score).catch(err =>
            console.warn('[App] createMatch failed:', err)
          );
        }
      }
    }

    setUndoStack(prev => [...prev, profileIndex]);
    setTimeout(() => {
      setProfileIndex(prev => prev + 1);
      setExitDirection(null);
    }, 220);
  }, [currentProfile, currentUser, matches, aiData, profileIndex, addToast]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) {
      addToast(t.toasts.undo_empty, 'info');
      return;
    }
    if (!isPaid) {
      setShowSubscription(true);
      addToast(t.toasts.rewind_premium, 'info');
      return;
    }
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(u => u.slice(0, -1));
    setProfileIndex(prev);
    if (matches.some(m => m.id === MATCH_PROFILES[prev]?.id)) {
      setMatches(m => m.filter(match => match.id !== MATCH_PROFILES[prev]?.id));
    }
    addToast(t.toasts.undo_done, 'info');
  }, [undoStack, isPaid, matches, addToast, t]);

  const handleSuperLike = useCallback(() => {
    if (!currentProfile) return;
    if (!isPaid) { setShowSubscription(true); return; }
    if (superLikes.remaining <= 0) {
      addToast(t.toasts.no_super_likes, 'info');
      return;
    }
    setSuperLikes(prev => ({ ...prev, remaining: prev.remaining - 1 }));
    setMatches(prev => {
      if (prev.some(m => m.id === currentProfile.id)) return prev;
      return [...prev, currentProfile];
    });
    if (aiData) setMatchAiMap(prev => ({ ...prev, [currentProfile.id]: aiData }));
    addToast(interpolate(t.toasts.super_like_sent, { name: currentProfile.name }), 'success');
    handleSwipe('right');
  }, [currentProfile, isPaid, superLikes, aiData, handleSwipe, addToast, t, interpolate]);

  const handleBoost = useCallback(() => {
    if (!isPaid) { setShowSubscription(true); return; }
    if (isBoosted) { addToast('Your profile is already boosted!', 'info'); return; }
    setIsBoosted(true);
    addToast(t.toasts.boost_activated, 'success');
    setTimeout(() => { setIsBoosted(false); addToast('Boost ended', 'info'); }, 30 * 60 * 1000);
  }, [isPaid, isBoosted, addToast, t]);

  const handleSubscriptionSuccess = useCallback((tier: SubscriptionTier) => {
    setSubscriptionTier(tier);
    addToast(interpolate(t.toasts.subscription_success, { tier: tier.charAt(0).toUpperCase() + tier.slice(1) }), 'success');
  }, [addToast, t, interpolate]);

  const handleUpdateProfile = useCallback((updated: UserProfile) => {
    setCurrentUser(updated);
    addToast(t.toasts.profile_saved, 'success');
    // Persist to Firestore
    upsertProfile({
      id: updated.id,
      name: updated.name,
      age: updated.age,
      job: updated.job,
      bio: updated.bio,
      image_url: updated.imageUrl,
      interests: updated.interests,
      location: updated.location ?? 'Douala',
      gender: (updated.gender as 'male' | 'female' | 'other') || 'other',
      verified: updated.verified ?? false,
      subscription_tier: subscriptionTier,
      last_active: new Date().toISOString(),
    }).catch(err => console.warn('[App] Profile update persist failed:', err));
  }, [addToast, t, subscriptionTier]);

  const openChat = useCallback((profile: UserProfile) => {
    setActiveChatProfile(profile);
  }, []);

  // Tier color map
  const tierColor: Record<SubscriptionTier, string> = {
    free: 'text-slate-400',
    plus: 'text-rose-400',
    gold: 'text-gold-500',
    platinum: 'text-purple-400',
  };

  const tierIcon: Record<SubscriptionTier, React.ReactNode> = {
    free: null,
    plus: <Zap className="w-3 h-3" />,
    gold: <Star className="w-3 h-3 fill-current" />,
    platinum: <Crown className="w-3 h-3" />,
  };

  return (
    <div className={`h-full w-full ${theme === 'royal' ? 'bg-slate-950' : 'bg-rose-950'} text-white font-sans overflow-hidden relative transition-colors duration-500`}>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Header (in-app) */}
      <AnimatePresence>
        {view === 'app' && !activeChatProfile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none h-16"
          >
            {/* Left */}
            <div className="pointer-events-auto flex items-center gap-1">
              {activeTab === 'discover' && (
                <button
                  className="p-2 bg-white/10 rounded-full text-slate-300 hover:bg-white/20 transition-colors"
                  onClick={() => setShowSettings(true)}
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}
              {/* Language toggle */}
              <button
                onClick={handleToggleLanguage}
                className="p-2 bg-white/10 rounded-full text-slate-300 hover:bg-white/20 transition-colors flex items-center gap-1"
                title={language === 'en' ? 'Passer en français' : 'Switch to English'}
              >
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">{language === 'en' ? 'FR' : 'EN'}</span>
              </button>
            </div>

            {/* Center */}
            {activeTab === 'discover' ? (
              <div className="flex items-center gap-1 pointer-events-auto">
                <AmouraLogo size={24} showText={true} textClassName={`text-2xl ${theme === 'royal' ? 'text-gold-400' : 'text-rose-500'}`} />
                {isPaid && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-black uppercase ${tierColor[subscriptionTier]}`}>
                    {tierIcon[subscriptionTier]}
                  </span>
                )}
              </div>
            ) : (
              <h2 className={`font-bold text-lg pointer-events-auto ${activeTab === 'matches' ? accentColor : 'text-white'}`}>
                {activeTab === 'matches' ? 'Matches' : 'Profile'}
              </h2>
            )}

            {/* Right */}
            <div className="pointer-events-auto w-8">
              {activeTab === 'discover' && isGoldPlus && (
                <button
                  className={`text-xs font-black px-2 py-1 rounded-full flex items-center gap-0.5 ${tierColor[subscriptionTier]} bg-white/10`}
                  onClick={() => addToast('See who likes you in the Matches tab ❤️', 'info')}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View */}
      <AnimatePresence mode="wait">

        {/* LANDING */}
        {view === 'landing' && (
          <motion.div key="landing" className="absolute inset-0 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}>
            <LandingPage onStart={() => setView('onboarding')} currentTheme={theme} onToggleTheme={handleToggleTheme} />
          </motion.div>
        )}

        {/* ONBOARDING */}
        {view === 'onboarding' && (
          <motion.div key="onboarding" className={`absolute inset-0 z-50 ${theme === 'royal' ? 'bg-slate-950' : 'bg-rose-950'}`}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {/* APP */}
        {view === 'app' && (
          <motion.div key="app" className="absolute inset-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <main className="flex-1 w-full relative h-full">
              <AnimatePresence mode="wait">

                {/* DISCOVER TAB */}
                {activeTab === 'discover' && (
                  <motion.div key="discover" className="absolute inset-0 flex flex-col"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    {/* Card Container */}
                    <div className="absolute inset-0 p-3 pt-16 h-full w-full max-w-lg mx-auto">
                      <AnimatePresence mode="wait" custom={exitDirection}>
                        {currentProfile ? (
                          <MatchCard
                            key={currentProfile.id}
                            profile={currentProfile}
                            aiData={aiData}
                            aiLoading={aiLoading}
                            onSwipe={handleSwipe}
                            onInfoClick={() => setShowInfoDrawer(true)}
                            direction={exitDirection}
                            theme={theme}
                          />
                        ) : (
                          <motion.div key="empty" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="relative mb-6">
                              <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900">
                                <img src={currentUser?.imageUrl} className="w-full h-full rounded-full opacity-40" />
                              </div>
                              <div className={`absolute inset-0 rounded-full animate-ping opacity-15 ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{t.discover.empty_title}</h3>
                            <p className="text-slate-500 mb-6 max-w-xs text-sm">{t.discover.empty_subtitle}</p>
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                              <button onClick={() => setProfileIndex(0)}
                                className={`px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r ${gradientClass} text-white shadow-lg`}>
                                {t.discover.empty_cta_review}
                              </button>
                              <button onClick={() => setShowSettings(true)}
                                className="px-8 py-3 rounded-full font-medium text-sm border border-white/20 text-slate-300">
                                {t.discover.empty_cta_settings}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Gamepad Controls */}
                    {currentProfile && (
                      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-4 z-30 pb-4">
                        <GamePadButton
                          icon={<RotateCcw className="w-5 h-5" />}
                          className="text-yellow-500 border-yellow-500/30 bg-black/60"
                          size="small"
                          onClick={handleUndo}
                          disabled={undoStack.length === 0}
                          label={t.buttons.undo}
                        />
                        <GamePadButton
                          icon={<X className="w-8 h-8" />}
                          className="text-red-400 border-red-500/30 bg-black/60"
                          size="large"
                          onClick={() => handleSwipe('left')}
                          label={t.buttons.nope}
                        />
                        <GamePadButton
                          icon={<Star className="w-5 h-5" />}
                          className="text-blue-400 border-blue-500/30 bg-black/60"
                          size="small"
                          onClick={handleSuperLike}
                          label={`${superLikes.remaining}`}
                        />
                        <GamePadButton
                          icon={<Heart className="w-8 h-8" />}
                          className="text-green-400 border-green-500/30 bg-black/60"
                          size="large"
                          fill
                          onClick={() => handleSwipe('right')}
                          label={t.buttons.like}
                        />
                        <GamePadButton
                          icon={<Zap className="w-5 h-5" />}
                          className="text-purple-400 border-purple-500/30 bg-black/60"
                          size="small"
                          onClick={handleBoost}
                          label={t.buttons.boost}
                        />
                      </div>
                    )}

                    {/* Profile Info Drawer */}
                    {currentProfile && (
                      <ProfileInfoDrawer
                        profile={currentProfile}
                        aiData={aiData}
                        isOpen={showInfoDrawer}
                        onClose={() => setShowInfoDrawer(false)}
                        onSuperLike={handleSuperLike}
                        onLike={() => handleSwipe('right')}
                        onNope={() => handleSwipe('left')}
                        theme={theme}
                      />
                    )}
                  </motion.div>
                )}

                {/* MATCHES TAB */}
                {activeTab === 'matches' && (
                  <motion.div key="matches" className="absolute inset-0 pt-16 overflow-y-auto scrollbar-hide"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                    {/* Gold: Who Likes You */}
                    {!isGoldPlus && (
                      <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowSubscription(true)}
                        className="mx-4 mb-4 mt-2 p-4 rounded-2xl bg-gradient-to-r from-gold-600/20 to-gold-500/10 border border-gold-500/30 flex items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-gold-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gold-400 text-sm">{t.matches.see_who_likes_title}</p>
                          <p className="text-xs text-slate-400">{t.matches.see_who_likes_desc}</p>
                        </div>
                        <Star className="w-5 h-5 text-gold-500 fill-current" />
                      </motion.div>
                    )}

                    {/* New Matches Row */}
                    <div className="px-4 mb-6">
                      <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${accentColor}`}>{t.matches.new_matches}</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex flex-col items-center gap-1 min-w-[70px]">
                          <div className={`w-16 h-16 rounded-full border-2 border-dashed border-slate-700 bg-slate-900 flex items-center justify-center ${accentColor}`}>
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-black">12</span>
                              <span className="text-[8px] font-bold uppercase">{t.matches.likes_label}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">{t.matches.likes_label}</span>
                        </div>
                        {matches.map(match => (
                          <div key={match.id} onClick={() => openChat(match)} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer">
                            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-orange-400">
                              <img src={match.imageUrl} className="w-full h-full rounded-full object-cover border-2 border-black" />
                            </div>
                            <span className="text-[10px] font-bold text-white">{match.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="px-4 pb-24">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">{t.matches.messages}</h3>
                      {matches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-600 text-center">
                          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 opacity-25" />
                          </div>
                          <p className="text-lg font-bold text-slate-400 mb-1">{t.matches.empty_title}</p>
                          <p className="text-sm">{t.matches.empty_subtitle}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {matches.map(match => (
                            <motion.button key={match.id} layout onClick={() => openChat(match)}
                              className="w-full p-3 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-colors group">
                              <div className="relative">
                                <img src={match.imageUrl} alt={match.name} className="w-14 h-14 rounded-full object-cover" />
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-950" />
                                {matchAiMap[match.id]?.score > 80 && (
                                  <div className={`absolute -top-1 -right-1 ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'} text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-black`}>
                                    {matchAiMap[match.id]?.score}%
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-left border-b border-white/5 pb-3">
                                <div className="flex justify-between items-center mb-0.5">
                                  <h3 className="font-bold text-white text-base">{match.name}</h3>
                                  <div className="flex items-center gap-1">
                                    {matchAiMap[match.id]?.score > 85 && (
                                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" /> Compatible
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500 truncate">{t.matches.chat_prompt}</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && currentUser && (
                  <motion.div key="profile" className="absolute inset-0 pt-0 overflow-y-auto scrollbar-hide bg-slate-950"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    {/* Header Image */}
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-slate-900" />
                      <div className={`absolute inset-0 opacity-50 bg-gradient-to-b ${theme === 'royal' ? 'from-gold-900' : 'from-rose-900'} to-slate-950`} />
                      {/* Premium Badge */}
                      {isPaid && (
                        <div className="absolute top-12 right-5 z-10">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-xs ${subscriptionTier === 'platinum' ? 'border-purple-500/40 bg-purple-500/15 text-purple-300' :
                            subscriptionTier === 'gold' ? 'border-gold-500/40 bg-gold-500/15 text-gold-400' :
                              'border-rose-500/40 bg-rose-500/15 text-rose-400'
                            }`}>
                            {tierIcon[subscriptionTier]}
                            Amoura {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
                          </div>
                        </div>
                      )}
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-900 shadow-2xl relative group cursor-pointer"
                          onClick={() => setShowEditProfile(true)}>
                          <img src={currentUser.imageUrl} className="w-full h-full rounded-full object-cover border-4 border-slate-950" alt="Profile" />
                          <div className={`absolute bottom-2 right-2 p-1.5 rounded-full border-2 border-slate-950 text-white shadow-lg ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'}`}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-20 px-6 pb-32 text-center">
                      <h2 className="text-3xl font-bold mb-0.5 flex items-center justify-center gap-2">
                        {currentUser.name}, {currentUser.age}
                        {isPaid && <CheckCircle className={`w-5 h-5 ${tierColor[subscriptionTier]} fill-current`} />}
                      </h2>
                      <p className="text-slate-400 font-medium">{currentUser.job}</p>
                      {currentUser.location && <p className="text-slate-500 text-sm mt-0.5">📍 {currentUser.location}</p>}

                      {/* Stats Row */}
                      <div className="flex justify-center gap-8 my-6">
                        <StatBlock label={t.profile.stat_matches} value={matches.length.toString()} />
                        <StatBlock label={t.profile.stat_super_likes} value={isPaid ? superLikes.remaining.toString() : '0'} />
                        <StatBlock label={t.profile.stat_profile_views} value="47" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center gap-6 mb-8">
                        <ActionButton icon={<Settings className="w-6 h-6" />} label={t.profile.btn_settings} onClick={() => setShowSettings(true)} />
                        <ActionButton
                          icon={<Shield className="w-8 h-8 fill-current" />}
                          label={isPaid ? t.profile.btn_premium : t.profile.btn_get_plus}
                          accent
                          onClick={() => setShowSubscription(true)}
                          theme={theme}
                        />
                        <ActionButton icon={<Edit3 className="w-6 h-6" />} label={t.profile.btn_edit} onClick={() => setShowEditProfile(true)} />
                      </div>

                      {/* Upgrade Card (if free) */}
                      {!isPaid && (
                        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowSubscription(true)}
                          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 p-0.5 cursor-pointer">
                          <div className="bg-slate-900/90 rounded-[14px] p-6 relative z-10">
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center mb-3">
                                <Star className="w-6 h-6 text-gold-500 fill-current" />
                              </div>
                              <h3 className="font-bold text-xl text-white mb-1">{t.profile.upgrade_title}</h3>
                              <p className="text-slate-400 text-sm mb-4">{t.profile.upgrade_desc}</p>
                              <div className="flex gap-2 items-baseline">
                                <span className="text-2xl font-black text-gold-400">4,990</span>
                                <span className="text-slate-400 text-sm">{t.profile.upgrade_per_month}</span>
                              </div>
                              <button className="mt-4 px-8 py-2.5 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 text-black font-bold text-sm">
                                {t.profile.upgrade_view_plans}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Interests */}
                      {currentUser.interests.length > 0 && (
                        <div className="mt-6 text-left">
                          <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">{t.profile.my_interests}</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentUser.interests.map((i, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-800 text-xs font-bold text-slate-300 border border-white/8">
                                {i}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Referral System */}
                      <ReferralSystem referralState={referralState} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} badgeCount={matches.length} theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChatProfile && (
          <motion.div key="chat"
            className={`absolute inset-0 z-50 ${theme === 'royal' ? 'bg-slate-950' : 'bg-slate-950'}`}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}>
            <ChatWindow
              matchProfile={activeChatProfile}
              aiData={matchAiMap[activeChatProfile.id] || null}
              subscriptionTier={subscriptionTier}
              currentUserId={currentUser?.id ?? 'anon'}
              matchId={[currentUser?.id ?? 'anon', activeChatProfile.id].sort().join('_')}
              onUnlockClick={() => setShowSubscription(true)}
              onBack={() => setActiveChatProfile(null)}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            filters={filters}
            onFiltersChange={setFilters}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Edit Profile Panel */}
      <AnimatePresence>
        {showEditProfile && currentUser && (
          <EditProfilePanel
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            currentUser={currentUser}
            onSave={handleUpdateProfile}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Global Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSuccess={handleSubscriptionSuccess}
        currentTier={subscriptionTier}
      />

      {/* Account Verification Modal */}
      {currentUser && (
        <AccountVerification
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          onVerified={() => {
            setIsAccountVerified(true);
            if (currentUser) {
              setCurrentUser(u => u ? { ...u, verified: true } : u);
            }
          }}
          userName={currentUser.name}
          userId={currentUser.id}
          theme={theme}
        />
      )}
    </div>
  );
};

const StatBlock: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-2xl font-black text-white">{value}</span>
    <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">{label}</span>
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean; theme?: Theme }> = ({ icon, label, onClick, accent, theme }) => (
  <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border transition-all ${accent
      ? `bg-gradient-to-br ${theme === 'royal' ? 'from-gold-600 to-gold-400' : 'from-rose-500 to-orange-500'} text-white border-transparent -mt-6 w-16 h-16 shadow-xl`
      : 'bg-slate-900 text-slate-400 border-white/5 group-hover:bg-slate-800 group-hover:text-white'
      }`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wide ${accent ? (theme === 'royal' ? 'text-gold-500' : 'text-rose-400') : 'text-slate-500'}`}>
      {label}
    </span>
  </div>
);

export default App;
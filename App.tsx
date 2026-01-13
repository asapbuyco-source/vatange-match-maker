import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserProfile, Theme } from './types';
import { useVantageAI } from './hooks/useVantageAI';
import MatchCard from './components/MatchCard';
import PaymentModal from './components/PaymentModal';
import ChatWindow from './components/ChatWindow';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import { Shield, RotateCcw, X, Star, Heart, Zap } from 'lucide-react';

// --- Demo Data ---
const MATCH_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Isabella',
    age: 24,
    job: 'Classical Violinist',
    bio: 'Music is the silence between the notes. Looking for someone to share the quiet moments with.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    interests: ['Violin', 'Opera', 'Literature']
  },
  {
    id: '2',
    name: 'Julian',
    age: 28,
    job: 'Architect',
    bio: 'Designing skylines by day, sketching portraits by night. I value structure and chaos equally.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    interests: ['Architecture', 'Sketching', 'Jazz']
  },
  {
    id: '3',
    name: 'Sophia',
    age: 25,
    job: 'Art Curator',
    bio: 'Life imitates art. Lets paint a masterpiece together.',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    interests: ['Modern Art', 'Wine', 'Travel']
  }
];

const App: React.FC = () => {
  // --- Theme State ---
  const [theme, setTheme] = useState<Theme>('royal');

  // --- Navigation State ---
  const [view, setView] = useState<'landing' | 'onboarding' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile'>('discover');
  
  // --- Data State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profileIndex, setProfileIndex] = useState(0);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [activeChatProfile, setActiveChatProfile] = useState<UserProfile | null>(null);
  
  // --- Feature State ---
  const [isPaid, setIsPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // --- Animation State ---
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  // Derived State
  const currentProfile = profileIndex < MATCH_PROFILES.length ? MATCH_PROFILES[profileIndex] : null;

  // AI Logic
  const { data: aiData, loading: aiLoading } = useVantageAI(
    currentUser || { id: 'temp', name: 'User', age: 0, job: '', bio: '', imageUrl: '', interests: [] }, 
    currentProfile
  );
  const [matchAiMap, setMatchAiMap] = useState<Record<string, any>>({});

  // Theme Colors Helper
  const accentColor = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
  const bgColor = theme === 'royal' ? 'bg-slate-950' : 'bg-rose-950'; // Using the defined custom dark bg

  // --- Handlers ---

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'royal' ? 'rose' : 'royal');
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setCurrentUser(profile);
    setView('app');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    
    if (direction === 'right' && currentProfile) {
      setMatches(prev => [...prev, currentProfile]);
      if (aiData) {
        setMatchAiMap(prev => ({ ...prev, [currentProfile.id]: aiData }));
      }
    }
    
    setTimeout(() => {
      setProfileIndex(prev => prev + 1);
      setExitDirection(null);
    }, 200);
  };

  const openChat = (profile: UserProfile) => {
    setActiveChatProfile(profile);
  };

  return (
    <div className={`h-full w-full ${bgColor} text-white font-sans overflow-hidden relative selection:bg-gold-500 transition-colors duration-500`}>
      
      {/* Top Header - Minimal */}
      <AnimatePresence>
        {view === 'app' && !activeChatProfile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
          >
            <div className="flex items-center gap-1 pointer-events-auto">
              <span className="font-serif font-bold text-xl tracking-tight text-white">Vantage</span>
              <span className={`text-xl font-bold ${accentColor}`}>.</span>
            </div>
            {currentUser && activeTab === 'profile' && (
               <button onClick={handleToggleTheme} className={`text-sm font-medium pointer-events-auto ${accentColor}`}>
                 {theme === 'royal' ? 'Rose Theme' : 'Royal Theme'}
               </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Switching */}
      <AnimatePresence mode="wait">
        
        {/* LANDING VIEW */}
        {view === 'landing' && (
          <motion.div 
            key="landing"
            className="absolute inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
          >
            <LandingPage 
              onStart={() => setView('onboarding')} 
              currentTheme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </motion.div>
        )}

        {/* ONBOARDING VIEW */}
        {view === 'onboarding' && (
          <motion.div 
            key="onboarding"
            className={`absolute inset-0 z-50 ${theme === 'royal' ? 'bg-slate-950' : 'bg-rose-950'}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -50 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {/* APP VIEW */}
        {view === 'app' && (
          <motion.div 
            key="app"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <main className="flex-1 w-full relative h-full">
              <AnimatePresence mode="wait">
                
                {/* TAB: DISCOVER */}
                {activeTab === 'discover' && (
                  <motion.div 
                    key="discover" 
                    className="absolute inset-0 flex flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Card Container */}
                    <div className="flex-1 relative w-full max-w-lg mx-auto p-4 pt-16 pb-24">
                      <AnimatePresence mode="wait" custom={exitDirection}>
                        {currentProfile ? (
                            <MatchCard 
                                key={currentProfile.id}
                                profile={currentProfile}
                                aiData={aiData}
                                aiLoading={aiLoading}
                                onSwipe={handleSwipe}
                                direction={exitDirection}
                                theme={theme}
                            />
                        ) : (
                          <motion.div 
                            key="empty"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center"
                          >
                             <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-6 shadow-lg animate-pulse">
                                <Shield className={`w-10 h-10 ${accentColor}`} />
                             </div>
                             <h3 className="text-xl font-bold mb-2">No more profiles</h3>
                             <p className="text-slate-500 mb-6 max-w-xs">You've seen everyone nearby. Upgrade to see global matches.</p>
                             <button 
                                onClick={() => setProfileIndex(0)}
                                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 font-medium transition-colors"
                             >
                               Review Again
                             </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Game Pad Controls */}
                    {currentProfile && (
                      <div className="absolute bottom-24 left-0 right-0 flex items-center justify-center gap-6 z-30 pb-4">
                        <GamePadButton 
                          icon={<RotateCcw className="w-5 h-5" />} 
                          color="text-yellow-500" 
                          borderColor="border-yellow-500" 
                          size="small"
                          onClick={() => {}} 
                        />
                        <GamePadButton 
                          icon={<X className="w-8 h-8" />} 
                          color="text-red-500" 
                          borderColor="border-red-500" 
                          size="large"
                          onClick={() => handleSwipe('left')}
                        />
                        <GamePadButton 
                          icon={<Star className="w-5 h-5" />} 
                          color="text-blue-500" 
                          borderColor="border-blue-500" 
                          size="small"
                          onClick={() => setShowPayment(true)}
                        />
                        <GamePadButton 
                          icon={<Heart className="w-8 h-8" />} 
                          color="text-green-500" 
                          borderColor="border-green-500" 
                          size="large"
                          fill
                          onClick={() => handleSwipe('right')}
                        />
                        <GamePadButton 
                          icon={<Zap className="w-5 h-5" />} 
                          color="text-purple-500" 
                          borderColor="border-purple-500" 
                          size="small"
                          onClick={() => setShowPayment(true)}
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB: MATCHES */}
                {activeTab === 'matches' && (
                  <motion.div 
                    key="matches"
                    className="absolute inset-0 pt-20 px-4 pb-24 overflow-y-auto"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className={`font-serif text-3xl font-bold mb-2 ${accentColor}`}>Matches</h2>
                    <p className="text-slate-500 text-sm mb-6">People you've liked who liked you back.</p>
                    
                    {matches.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-6 h-6 opacity-20" />
                         </div>
                        <p>No matches yet. Keep swiping!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {matches.map(match => (
                          <motion.button 
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => openChat(match)}
                            className="w-full p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors group"
                          >
                            <div className="relative">
                               <img src={match.imageUrl} alt={match.name} className={`w-16 h-16 rounded-full object-cover border-2 border-white/10 group-hover:border-${theme === 'royal' ? 'gold-500' : 'rose-500'} transition-colors`} />
                               {matchAiMap[match.id]?.score > 80 && (
                                 <div className={`absolute -top-1 -right-1 ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'} text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
                                   {matchAiMap[match.id]?.score}%
                                 </div>
                               )}
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="font-bold text-lg text-white">{match.name}</h3>
                              <p className="text-xs text-slate-400 truncate w-48">{match.bio}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'}`} />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB: PROFILE */}
                {activeTab === 'profile' && currentUser && (
                    <motion.div 
                      key="profile"
                      className="absolute inset-0 pt-24 px-6 pb-32 overflow-y-auto flex flex-col items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="relative mb-6">
                        <div className={`w-36 h-36 rounded-full p-1 bg-gradient-to-tr ${theme === 'royal' ? 'from-gold-500 to-purple-600' : 'from-rose-500 to-pink-600'} shadow-2xl`}>
                            <img src={currentUser.imageUrl} className="w-full h-full rounded-full object-cover border-4 border-black" alt="Profile" />
                        </div>
                        {isPaid && <div className={`absolute bottom-2 right-2 ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'} text-black p-1.5 rounded-full border-4 border-black`}><Star className="w-4 h-4 fill-current"/></div>}
                      </div>
                      
                      <h2 className="font-serif text-3xl font-bold mb-1">{currentUser.name}, {currentUser.age}</h2>
                      <p className="text-slate-400 mb-8">{currentUser.job}</p>

                      <div className="w-full max-w-sm space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                              <div className="text-xl font-bold text-white">0</div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Matches</div>
                           </div>
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                              <div className="text-xl font-bold text-white">85%</div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Comp.</div>
                           </div>
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                              <div className="text-xl font-bold text-white">3</div>
                              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Likes</div>
                           </div>
                        </div>

                        {!isPaid && (
                          <button 
                            onClick={() => setShowPayment(true)}
                            className={`w-full py-4 bg-gradient-to-r ${theme === 'royal' ? 'from-gold-600 to-gold-500 shadow-gold-900/20' : 'from-rose-600 to-rose-500 shadow-rose-900/20'} rounded-xl text-black font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2`}
                          >
                            <Star className="w-5 h-5 fill-black" /> Upgrade to Vantage Gold
                          </button>
                        )}
                        <button className="w-full py-4 bg-white/5 rounded-xl text-white font-medium hover:bg-white/10 active:scale-95 transition-transform border border-white/5">
                          Edit Profile
                        </button>
                        <button className="w-full py-4 bg-white/5 rounded-xl text-white font-medium hover:bg-white/10 active:scale-95 transition-transform border border-white/5">
                          Settings
                        </button>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </main>

            <BottomNav 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              badgeCount={matches.length}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChatProfile && (
          <motion.div 
            key="chat-overlay"
            className={`absolute inset-0 z-50 ${theme === 'royal' ? 'bg-slate-950' : 'bg-rose-950'}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <ChatWindow 
              matchProfile={activeChatProfile}
              aiData={matchAiMap[activeChatProfile.id] || null}
              isPaid={isPaid}
              onUnlockClick={() => setShowPayment(true)}
              onBack={() => setActiveChatProfile(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Payment Modal */}
      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)}
        onSuccess={() => setIsPaid(true)}
      />

    </div>
  );
};

// Helper Component for Game Pad Buttons
const GamePadButton = ({ icon, color, borderColor, size, onClick, fill }: any) => {
  const isLarge = size === 'large';
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        ${isLarge ? 'w-16 h-16' : 'w-12 h-12'} 
        rounded-full bg-slate-900 border ${borderColor} 
        flex items-center justify-center 
        shadow-lg shadow-black/40
        transition-colors hover:bg-slate-800
      `}
    >
      <div className={`${color} ${fill ? 'fill-current' : ''}`}>
        {icon}
      </div>
    </motion.button>
  );
};

export default App;
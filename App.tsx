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
import { Shield, RotateCcw, X, Star, Heart, Zap, Search, Settings, Edit3 } from 'lucide-react';

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
  const [theme, setTheme] = useState<Theme>('rose'); 

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
  const bgColor = theme === 'royal' ? 'bg-slate-950' : 'bg-rose-950';
  const gradientClass = theme === 'royal' ? 'from-gold-600 to-gold-400' : 'from-rose-500 to-rose-400';

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
    <div className={`h-full w-full ${bgColor} text-white font-sans overflow-hidden relative selection:bg-rose-500 transition-colors duration-500`}>
      
      {/* Top Header */}
      <AnimatePresence>
        {view === 'app' && !activeChatProfile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none h-16"
          >
             <div className="w-8">
               {/* Spacer for layout balance */}
               {activeTab === 'discover' && (
                 <button className="pointer-events-auto p-2 bg-white/10 rounded-full text-slate-300">
                    <Shield className="w-5 h-5"/>
                 </button>
               )}
             </div>

             {/* Center Logo */}
             {activeTab === 'discover' ? (
                <div className="flex items-center gap-1 pointer-events-auto drop-shadow-lg">
                  <span className={`font-serif font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${theme === 'royal' ? 'from-gold-300 to-yellow-600' : 'from-rose-400 to-rose-600'}`}>
                    Vantage
                  </span>
                </div>
             ) : (
                <h2 className={`font-bold text-lg pointer-events-auto ${activeTab === 'matches' ? accentColor : 'text-white'}`}>
                    {activeTab === 'matches' ? 'Matches' : 'Profile'}
                </h2>
             )}

             <div className="w-8"></div>
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
                    <div className="flex-1 relative w-full h-full flex flex-col justify-end pb-32">
                      <div className="absolute inset-0 p-3 pt-16 h-full w-full max-w-lg mx-auto">
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
                              className="flex flex-col items-center justify-center h-full text-center p-8"
                            >
                               <div className="relative">
                                  <div className={`w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center mb-6 z-10 relative bg-slate-900`}>
                                     <img src={currentUser?.imageUrl} className="w-full h-full rounded-full opacity-50" />
                                  </div>
                                  <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'}`}></div>
                               </div>
                               <h3 className="text-xl font-bold mb-2 text-white">There's no one new around you.</h3>
                               <p className="text-slate-500 mb-6 max-w-xs">Upgrade to Passport to see people globally.</p>
                               <button 
                                  onClick={() => setProfileIndex(0)}
                                  className={`px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r ${gradientClass} text-white shadow-lg active:scale-95 transition-transform`}
                               >
                                 REVIEW PROFILES
                               </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Game Pad Controls */}
                    {currentProfile && (
                      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-5 z-30 pb-4">
                        <GamePadButton 
                          icon={<RotateCcw className="w-5 h-5" />} 
                          className="text-yellow-500 border-yellow-500/20 bg-black/60"
                          size="small"
                          onClick={() => {}} 
                        />
                        <GamePadButton 
                          icon={<X className="w-8 h-8" />} 
                          className="text-red-500 border-red-500/20 bg-black/60"
                          size="large"
                          onClick={() => handleSwipe('left')}
                        />
                        <GamePadButton 
                          icon={<Star className="w-5 h-5" />} 
                          className="text-blue-500 border-blue-500/20 bg-black/60"
                          size="small"
                          onClick={() => setShowPayment(true)}
                        />
                        <GamePadButton 
                          icon={<Heart className="w-8 h-8" />} 
                          className="text-green-500 border-green-500/20 bg-black/60"
                          size="large"
                          fill
                          onClick={() => handleSwipe('right')}
                        />
                        <GamePadButton 
                          icon={<Zap className="w-5 h-5" />} 
                          className="text-purple-500 border-purple-500/20 bg-black/60"
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
                    className="absolute inset-0 pt-16 overflow-y-auto"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* New Matches Row */}
                    <div className="px-4 mb-6">
                       <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${accentColor}`}>New Matches</h3>
                       <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          <div className="flex flex-col items-center gap-1 min-w-[80px]">
                              <div className={`w-16 h-16 rounded-full border-2 border-dashed border-slate-700 bg-slate-900 flex items-center justify-center ${accentColor}`}>
                                 <span className="text-2xl font-serif font-bold">12</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400">Likes</span>
                          </div>
                          {matches.map(match => (
                             <div key={match.id} onClick={() => openChat(match)} className="flex flex-col items-center gap-1 min-w-[80px] cursor-pointer">
                                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-orange-400">
                                   <img src={match.imageUrl} className="w-full h-full rounded-full object-cover border-2 border-black" />
                                </div>
                                <span className="text-xs font-bold text-white">{match.name}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Messages List */}
                    <div className="px-4">
                       <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Messages</h3>
                       
                       {matches.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-center">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                               <Search className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-lg font-bold text-slate-400">No messages yet</p>
                            <p className="text-sm">Start swiping to connect with people!</p>
                         </div>
                       ) : (
                         <div className="flex flex-col gap-1">
                           {matches.map(match => (
                             <motion.button 
                               key={match.id}
                               layout
                               onClick={() => openChat(match)}
                               className="w-full p-3 hover:bg-white/5 rounded-xl flex items-center gap-4 transition-colors group"
                             >
                               <div className="relative">
                                  <img src={match.imageUrl} alt={match.name} className="w-16 h-16 rounded-full object-cover" />
                                  {matchAiMap[match.id]?.score > 80 && (
                                    <div className={`absolute -bottom-1 -right-1 ${theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-black`}>
                                      {matchAiMap[match.id]?.score}%
                                    </div>
                                  )}
                               </div>
                               <div className="flex-1 text-left border-b border-white/5 pb-3">
                                 <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-lg text-white">{match.name}</h3>
                                    {matchAiMap[match.id]?.score > 85 && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">Compatible</span>}
                                 </div>
                                 <p className="text-sm text-slate-400 truncate w-56">Matched! Say hello with a magic icebreaker.</p>
                               </div>
                             </motion.button>
                           ))}
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}

                {/* TAB: PROFILE */}
                {activeTab === 'profile' && currentUser && (
                    <motion.div 
                      key="profile"
                      className="absolute inset-0 pt-0 overflow-y-auto bg-slate-950"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Top Profile Header */}
                      <div className="relative h-64 overflow-hidden">
                         <div className="absolute inset-0 bg-slate-900"></div>
                         <div className={`absolute inset-0 opacity-40 bg-gradient-to-b ${theme === 'royal' ? 'from-gold-900' : 'from-rose-900'} to-slate-950`}></div>
                         
                         <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-900 shadow-2xl relative group cursor-pointer">
                                <img src={currentUser.imageUrl} className="w-full h-full rounded-full object-cover border-4 border-slate-950" alt="Profile" />
                                <div className={`absolute bottom-2 right-2 p-2 rounded-full bg-slate-800 border-2 border-slate-950 text-white shadow-lg`}>
                                   <Edit3 className="w-4 h-4"/>
                                </div>
                            </div>
                         </div>
                      </div>

                      <div className="pt-20 px-6 pb-32 text-center">
                        <h2 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
                          {currentUser.name}, {currentUser.age}
                          {isPaid && <Star className={`w-5 h-5 ${accentColor} fill-current`}/>}
                        </h2>
                        <p className="text-slate-400 mb-8 font-medium">{currentUser.job}</p>

                        <div className="flex justify-center gap-8 mb-10">
                           <div className="flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors shadow-lg border border-white/5">
                                 <Settings className="w-6 h-6"/>
                              </div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Settings</span>
                           </div>
                           <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => handleToggleTheme()}>
                              <div className="w-16 h-16 -mt-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-rose-900/30 active:scale-95 transition-transform border-4 border-slate-950">
                                 <Shield className="w-8 h-8 fill-current"/>
                              </div>
                              <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">Get Plus</span>
                           </div>
                           <div className="flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors shadow-lg border border-white/5">
                                 <Edit3 className="w-6 h-6"/>
                              </div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Edit Info</span>
                           </div>
                        </div>

                        {!isPaid && (
                           <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 p-0.5 cursor-pointer" onClick={() => setShowPayment(true)}>
                              <div className="bg-slate-900/90 rounded-[14px] p-6 relative z-10">
                                 <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mb-3">
                                       <Star className="w-6 h-6 text-rose-500 fill-current" />
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1">Get Vantage Gold</h3>
                                    <p className="text-slate-400 text-sm mb-4">See who likes you & more!</p>
                                    <button className="py-2 px-6 rounded-full bg-white text-black font-bold text-sm">MY VANTAGE PLUS</button>
                                 </div>
                              </div>
                           </div>
                        )}
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
const GamePadButton = ({ icon, className, size, onClick, fill }: any) => {
  const isLarge = size === 'large';
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        ${isLarge ? 'w-16 h-16' : 'w-12 h-12'} 
        rounded-full border flex items-center justify-center 
        shadow-xl backdrop-blur-sm
        transition-all duration-200
        ${className}
      `}
    >
      <div className={fill ? 'fill-current' : ''}>
        {icon}
      </div>
    </motion.button>
  );
};

export default App;
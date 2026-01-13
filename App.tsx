import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserProfile } from './types';
import { useVantageAI } from './hooks/useVantageAI';
import MatchCard from './components/MatchCard';
import PaymentModal from './components/PaymentModal';
import ChatWindow from './components/ChatWindow';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import { Shield } from 'lucide-react';

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

  // Derived State
  const currentProfile = profileIndex < MATCH_PROFILES.length ? MATCH_PROFILES[profileIndex] : null;

  // AI Logic
  const { data: aiData, loading: aiLoading } = useVantageAI(
    currentUser || { id: 'temp', name: 'User', age: 0, job: '', bio: '', imageUrl: '', interests: [] }, 
    currentProfile
  );
  const [matchAiMap, setMatchAiMap] = useState<Record<string, any>>({});

  // --- Handlers ---

  const handleOnboardingComplete = (profile: UserProfile) => {
    setCurrentUser(profile);
    setView('app');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentProfile) {
      setMatches(prev => [...prev, currentProfile]);
      if (aiData) {
        setMatchAiMap(prev => ({ ...prev, [currentProfile.id]: aiData }));
      }
    }
    // Delay slightly to let the drag/exit animation of MatchCard play out if handled internally
    // or simply trigger re-render which AnimatePresence will handle.
    setTimeout(() => {
      setProfileIndex(prev => prev + 1);
    }, 200);
  };

  const openChat = (profile: UserProfile) => {
    setActiveChatProfile(profile);
  };

  return (
    <div className="h-full w-full bg-slate-950 text-white font-sans overflow-hidden relative">
      
      {/* Top Header - Visible in App View */}
      <AnimatePresence>
        {view === 'app' && !activeChatProfile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none"
          >
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="font-serif font-bold text-2xl tracking-tight text-white">Vantage</span>
              <span className="text-gold-500 text-2xl">.</span>
            </div>
            {currentUser && (
              <div className="w-8 h-8 rounded-full bg-gold-500 p-[1px] pointer-events-auto shadow-lg shadow-gold-500/20">
                  <img src={currentUser.imageUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
              </div>
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
            className="absolute inset-0 z-50 bg-[#0f172a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <LandingPage onStart={() => setView('onboarding')} />
          </motion.div>
        )}

        {/* ONBOARDING VIEW */}
        {view === 'onboarding' && (
          <motion.div 
            key="onboarding"
            className="absolute inset-0 z-50 bg-slate-950"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {/* APP VIEW */}
        {view === 'app' && (
          <motion.div 
            key="app"
            className="absolute inset-0 flex flex-col bg-slate-950"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <main className="flex-1 w-full relative">
              <AnimatePresence mode="wait">
                
                {/* TAB: DISCOVER */}
                {activeTab === 'discover' && (
                  <motion.div 
                    key="discover" 
                    className="absolute inset-0 pt-10"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {currentProfile ? (
                            <div className="w-full h-full flex items-center justify-center relative" key="cards-container">
                              <MatchCard 
                                key={currentProfile.id}
                                profile={currentProfile}
                                aiData={aiData}
                                aiLoading={aiLoading}
                                onSwipe={handleSwipe}
                              />
                            </div>
                        ) : (
                          <motion.div 
                            key="empty-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-8"
                          >
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-gold-500/10 shadow-2xl">
                                <Shield className="w-8 h-8 text-slate-600" />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-white mb-2">You're caught up</h2>
                            <p className="text-slate-400 max-w-xs mx-auto mb-8">
                              We've shown you everyone in your immediate area fitting your preferences.
                            </p>
                            <button 
                              onClick={() => setProfileIndex(0)}
                              className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-medium hover:bg-white/10 transition-colors"
                            >
                              Review Profiles
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* TAB: MATCHES */}
                {activeTab === 'matches' && (
                  <motion.div 
                    key="matches"
                    className="absolute inset-0 pt-24 px-6 pb-32 overflow-y-auto"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-serif text-3xl font-bold mb-6">Your Matches</h2>
                    {matches.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <p>No matches yet. Keep swiping!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matches.map(match => (
                          <motion.button 
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => openChat(match)}
                            className="w-full p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-slate-800 transition-colors"
                          >
                            <img src={match.imageUrl} alt={match.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                            <div className="flex-1 text-left">
                              <h3 className="font-bold text-lg text-white">{match.name}</h3>
                              <p className="text-xs text-gold-500 font-medium">
                                {matchAiMap[match.id]?.score || 0}% Compatible
                              </p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
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
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-gold-500 to-purple-600 mb-4 shadow-2xl shadow-purple-900/50">
                        <img src={currentUser.imageUrl} className="w-full h-full rounded-full object-cover border-4 border-slate-950" alt="Profile" />
                      </div>
                      <h2 className="font-serif text-3xl font-bold mb-1">{currentUser.name}, {currentUser.age}</h2>
                      <p className="text-slate-400 mb-8">{currentUser.job}</p>

                      <div className="w-full max-w-xs space-y-3">
                        <div className="p-4 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-sm text-slate-300">Plan</span>
                          <span className={`text-sm font-bold ${isPaid ? 'text-gold-500' : 'text-slate-500'}`}>
                            {isPaid ? 'Premium Member' : 'Free Tier'}
                          </span>
                        </div>
                        {!isPaid && (
                          <button 
                            onClick={() => setShowPayment(true)}
                            className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-500 rounded-xl text-black font-bold shadow-lg shadow-gold-900/20 active:scale-95 transition-transform"
                          >
                            Upgrade to Premium
                          </button>
                        )}
                        <button className="w-full py-4 bg-white/5 rounded-xl text-white font-medium hover:bg-white/10 active:scale-95 transition-transform">
                          Edit Preferences
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
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChatProfile && (
          <motion.div 
            key="chat-overlay"
            className="absolute inset-0 z-50 bg-slate-950"
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

export default App;
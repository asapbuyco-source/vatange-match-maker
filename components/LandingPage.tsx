import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Shield, ArrowRight, MessageCircle, HelpCircle, Mail, Phone, MapPin, ChevronDown, Palette } from 'lucide-react';
import { Theme } from '../types';

interface LandingPageProps {
  onStart: () => void;
  currentTheme: Theme;
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, currentTheme, onToggleTheme }) => {
  const [activeSection, setActiveSection] = useState<'home' | 'contact' | 'support'>('home');

  // Theme-based colors
  const accentColor = currentTheme === 'royal' ? 'text-gold-500' : 'text-rose-500';
  const btnColor = currentTheme === 'royal' ? 'bg-gold-500 hover:bg-gold-400' : 'bg-rose-500 hover:bg-rose-400';
  const gradientText = currentTheme === 'royal' 
    ? 'from-gold-300 via-yellow-200 to-gold-500' 
    : 'from-rose-300 via-pink-200 to-rose-500';
  
  // Dynamic Background Images
  const heroImage = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop"; // Wedding couple

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id as any);
  };

  return (
    <div className={`min-h-screen w-full text-white overflow-y-auto overflow-x-hidden relative scroll-smooth ${currentTheme === 'royal' ? 'bg-slate-950 selection:bg-gold-500' : 'bg-rose-950 selection:bg-rose-500'} selection:text-black`}>
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md border-b ${currentTheme === 'royal' ? 'border-white/10 bg-slate-950/80' : 'border-white/10 bg-rose-950/80'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTheme === 'royal' ? 'bg-gold-500' : 'bg-rose-500'}`}>
                <span className="font-serif font-bold text-black text-xl">V</span>
             </div>
             <span className="font-serif font-bold text-xl tracking-tight">Vantage</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => scrollToSection('stories')} className="hover:text-white transition-colors">Success Stories</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={onToggleTheme}
               className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
               title="Switch Theme"
             >
               <Palette className={`w-5 h-5 ${accentColor}`} />
             </button>
             <button 
               onClick={onStart}
               className={`px-6 py-2 rounded-full font-bold text-black text-sm transition-all shadow-lg hover:scale-105 ${btnColor}`}
             >
               Launch App
             </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] ${currentTheme === 'royal' ? 'bg-purple-900/20' : 'bg-rose-900/20'} rounded-full blur-[120px] animate-pulse`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] ${currentTheme === 'royal' ? 'bg-gold-500/10' : 'bg-pink-500/10'} rounded-full blur-[100px]`} />
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl text-left flex-1"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6 ${accentColor}`}>
             <Sparkles className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-wider">The Future of Dating is Here</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
            Find the Love <br/>
            You've Always <br/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText} italic`}>
              Dreamed Of.
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-lg mb-8 leading-relaxed font-light">
            Vantage uses advanced behavioral AI to connect you with people who share your values. From first dates to forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onStart}
              className={`px-8 py-4 rounded-full font-bold text-lg text-black shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 ${btnColor}`}
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollToSection('stories')}
              className="px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-all"
            >
              See Success Stories
            </button>
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex-1 w-full max-w-lg"
        >
          <div className="relative">
             {/* Main Image */}
             <div className="rounded-[40px] overflow-hidden border-8 border-white/5 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
               <img src={heroImage} alt="Happy Couple" className="w-full h-[500px] object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-widest mb-1 text-white/80">Success Story</p>
                  <p className="font-serif text-2xl">Sarah & James, Married 2023</p>
               </div>
             </div>

             {/* Floating Badge */}
             <div className={`absolute -bottom-10 -left-10 p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl ${currentTheme === 'royal' ? 'bg-slate-900/90' : 'bg-rose-950/90'}`}>
                <div className="flex items-center gap-3 mb-2">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-700 flex items-center justify-center text-[10px]`}>{i}</div>
                      ))}
                   </div>
                   <span className="font-bold text-xl">10k+</span>
                </div>
                <p className="text-sm text-slate-400">Matches made this month</p>
             </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 cursor-pointer z-20"
          onClick={() => scrollToSection('stories')}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* --- SUCCESS STORIES SECTION --- */}
      <section id="stories" className={`py-24 px-6 relative z-10 ${currentTheme === 'royal' ? 'bg-slate-900/50' : 'bg-black/20'}`}>
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Real Stories, Real Love</h2>
               <p className="text-slate-400 max-w-2xl mx-auto">See how Vantage Match has helped thousands find their perfect partner.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               <StoryCard 
                  image="https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=800&auto=format&fit=crop"
                  names="Elena & Marcus"
                  quote="We matched on Vantage and knew instantly. The compatibility score wasn't lying!"
                  theme={currentTheme}
               />
               <StoryCard 
                  image="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop"
                  names="David & Chris"
                  quote="Finally, an app that focuses on what actually matters. 2 years strong."
                  theme={currentTheme}
               />
               <StoryCard 
                  image="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop"
                  names="Priya & Raj"
                  quote="From a magic icebreaker to our wedding day. Thank you Vantage!"
                  theme={currentTheme}
               />
            </div>
         </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Why Choose Vantage?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We've reimagined the dating experience to prioritize safety, quality, and genuine connection.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className={`w-8 h-8 ${accentColor}`} />}
              title="Identity Verified"
              desc="Every profile is verified to ensure you are talking to real people. No bots, no catfishing."
              theme={currentTheme}
            />
            <FeatureCard 
              icon={<Heart className={`w-8 h-8 ${accentColor}`} />}
              title="AI Compatibility"
              desc="Our deep-learning algorithms analyze compatibility beyond surface level interests."
              theme={currentTheme}
            />
            <FeatureCard 
              icon={<MessageCircle className={`w-8 h-8 ${accentColor}`} />}
              title="Magic Icebreakers"
              desc="Never struggle with what to say. Get AI-generated conversation starters tailored to your match."
              theme={currentTheme}
            />
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className={`py-24 px-6 relative z-10 ${currentTheme === 'royal' ? 'bg-purple-900/20' : 'bg-rose-900/20'}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-5xl font-bold mb-6">Get in Touch</h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
              Have a success story? Need technical help? Or just want to say hi? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 ${currentTheme === 'royal' ? 'bg-slate-900' : 'bg-black'}`}>
                  <Mail className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Email Us</p>
                  <p className="text-lg">hello@vantage.match</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 ${currentTheme === 'royal' ? 'bg-slate-900' : 'bg-black'}`}>
                  <Phone className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Call Us</p>
                  <p className="text-lg">+256 700 000 000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 ${currentTheme === 'royal' ? 'bg-slate-900' : 'bg-black'}`}>
                  <MapPin className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Visit Us</p>
                  <p className="text-lg">Kampala, Uganda</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border border-white/10 ${currentTheme === 'royal' ? 'bg-slate-900' : 'bg-[#1a0505]'}`}>
             <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-white/30 transition-colors" placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-white/30 transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-white/30 transition-colors" placeholder="jane@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Message</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32 resize-none focus:outline-none focus:border-white/30 transition-colors" placeholder="How can we help?" />
                </div>
                <button type="button" className={`w-full py-4 rounded-xl font-bold text-black mt-4 transition-transform hover:scale-[1.02] ${btnColor}`}>
                  Send Message
                </button>
             </form>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <p className="text-slate-500 text-sm font-serif italic">
          © 2024 Vantage Match. Elevate your standards.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, theme }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors ${theme === 'royal' ? 'bg-slate-900' : 'bg-[#1a0505]'}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${theme === 'royal' ? 'bg-slate-800' : 'bg-rose-950'}`}>
      {icon}
    </div>
    <h3 className="font-serif font-bold text-2xl text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {desc}
    </p>
  </motion.div>
);

const StoryCard = ({ image, names, quote, theme }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={`rounded-3xl overflow-hidden border border-white/5 group ${theme === 'royal' ? 'bg-slate-900' : 'bg-[#1a0505]'}`}
  >
    <div className="h-64 overflow-hidden relative">
      <img src={image} alt={names} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
    </div>
    <div className="p-8 relative">
       <div className={`absolute -top-6 right-8 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg ${theme === 'royal' ? 'bg-gold-500 text-black' : 'bg-rose-500 text-white'}`}>
         "
       </div>
       <h3 className="font-serif text-2xl font-bold mb-2">{names}</h3>
       <p className="text-slate-400 italic leading-relaxed">{quote}</p>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer, theme }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-xl border border-white/5 overflow-hidden transition-all ${theme === 'royal' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-[#1a0505] hover:bg-rose-950'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center"
      >
        <span className="font-bold text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6"
          >
            <p className="text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
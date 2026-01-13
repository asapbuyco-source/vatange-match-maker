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
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('support')} className="hover:text-white transition-colors">Support</button>
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
      <section id="home" className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-center text-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[10%] left-[10%] w-96 h-96 ${currentTheme === 'royal' ? 'bg-purple-600/20' : 'bg-rose-600/20'} rounded-full blur-[100px] animate-pulse`} />
          <div className={`absolute bottom-[10%] right-[10%] w-96 h-96 ${currentTheme === 'royal' ? 'bg-gold-500/10' : 'bg-pink-500/10'} rounded-full blur-[100px]`} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6 ${accentColor}`}>
             <Sparkles className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-wider">The Future of Dating is Here</span>
          </div>

          <h1 className="font-serif text-6xl md:text-8xl font-bold leading-[1.1] mb-8">
            Find Love, <br/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText} italic`}>
              Designed for You.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Vantage uses advanced behavioral AI to connect you with people who match your soul, not just your checklist. Secure, beautiful, and deeply personal.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onStart}
              className={`px-8 py-4 rounded-full font-bold text-lg text-black shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 ${btnColor}`}
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-all"
            >
              Explore Features
            </button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 cursor-pointer"
          onClick={() => scrollToSection('features')}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className={`py-24 px-6 relative z-10 ${currentTheme === 'royal' ? 'bg-slate-900/50' : 'bg-black/20'}`}>
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

      {/* --- SUPPORT / FAQ SECTION --- */}
      <section id="support" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className={`p-3 rounded-xl ${currentTheme === 'royal' ? 'bg-purple-900/50' : 'bg-rose-900/50'}`}>
              <HelpCircle className={`w-8 h-8 ${accentColor}`} />
            </div>
            <div>
               <h2 className="font-serif text-4xl font-bold">Support Center</h2>
               <p className="text-slate-400">Common questions and helpful answers.</p>
            </div>
          </div>

          <div className="space-y-4">
            <FAQItem 
              question="Is Vantage Match free to use?" 
              answer="Vantage offers a generous free tier allowing you to match and chat. Our Gold tier unlocks advanced AI insights and unlimited swipes." 
              theme={currentTheme}
            />
            <FAQItem 
              question="How does the AI matching work?" 
              answer="We analyze your bio, interests, and interaction style to find patterns compatible with other users, assigning a unique Compatibility Score." 
              theme={currentTheme}
            />
            <FAQItem 
              question="Is my payment information secure?" 
              answer="Yes. We use standard mobile money protocols (USSD push). We do not store your PIN or sensitive banking data." 
              theme={currentTheme}
            />
            <FAQItem 
              question="Can I change my location?" 
              answer="Currently, Vantage uses your device location to find matches within a 50km radius. Travel mode is coming soon." 
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
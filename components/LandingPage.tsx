import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Shield, ArrowRight, MessageCircle, Mail, Phone, MapPin, ChevronDown, Palette, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { Theme } from '../types';

interface LandingPageProps {
  onStart: () => void;
  currentTheme: Theme;
  onToggleTheme: () => void;
}

const WHATSAPP_NUMBER = '237657960690';

const FAQ_ITEMS = [
  { q: 'Is Vantage Match available across Cameroon?', a: 'Yes! We serve all major cities including Douala, Yaoundé, Bafoussam, Bamenda, Garoua, and more. Our Passport feature lets you connect with people across the whole country.' },
  { q: 'How does the AI compatibility scoring work?', a: 'Our AI analyzes shared interests, personality traits from your bio, and behavioral patterns to generate a compatibility score and tailored icebreaker for every potential match.' },
  { q: 'How do I pay for a subscription?', a: 'We support MTN Mobile Money and Orange Money — the most popular payment methods in Cameroon. Simply enter your number and approve the USSD prompt.' },
  { q: 'Is my profile safe and private?', a: 'Absolutely. Your data is encrypted and never shared with third parties. You can report or block any user at any time from the chat screen.' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart, currentTheme, onToggleTheme }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactData, setContactData] = useState({ name: '', message: '' });
  const [sent, setSent] = useState(false);

  const isRoyal = currentTheme === 'royal';
  const accent = isRoyal ? 'text-gold-500' : 'text-rose-500';
  const accentBg = isRoyal ? 'bg-gold-500' : 'bg-rose-500';
  const gradientText = isRoyal ? 'from-gold-300 via-yellow-200 to-gold-500' : 'from-rose-300 via-pink-200 to-rose-500';
  const btnColor = isRoyal ? 'bg-gold-500 hover:bg-gold-400 text-black' : 'bg-rose-500 hover:bg-rose-400 text-white';
  const heroImage = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop';

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.message.trim()) return;
    const greeting = contactData.name ? `Hi, I'm *${contactData.name.trim()}*.\n\n` : '';
    const text = encodeURIComponent(`${greeting}${contactData.message.trim()}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    setSent(true);
    setContactData({ name: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className={`h-full w-full text-white overflow-y-auto overflow-x-hidden relative scroll-smooth ${isRoyal ? 'bg-slate-950' : 'bg-rose-950'} selection:text-white`}>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md border-b border-white/8 ${isRoyal ? 'bg-slate-950/80' : 'bg-rose-950/80'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentBg}`}>
              <span className="font-serif font-bold text-black text-xl">V</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">Vantage</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            {['home', 'stories', 'features', 'contact'].map(s => (
              <button key={s} onClick={() => scrollTo(s)} className="hover:text-white transition-colors capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onToggleTheme} className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors" title="Switch Theme">
              <Palette className={`w-5 h-5 ${accent}`} />
            </button>
            <button onClick={onStart} className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105 ${btnColor}`}>
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] ${isRoyal ? 'bg-purple-900/20' : 'bg-rose-900/20'} rounded-full blur-[120px] animate-pulse`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] ${isRoyal ? 'bg-gold-500/8' : 'bg-pink-500/8'} rounded-full blur-[100px]`} />
        </div>

        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-2xl text-left flex-1">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6 ${accent}`}>
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Cameroon's #1 AI Dating App</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
            Find Real Love <br /> In Cameroon <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientText} italic`}>Today.</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-lg mb-8 leading-relaxed font-light">
            From Douala to Yaoundé — Vantage uses advanced AI to connect you with people who truly match your values, interests, and personality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onStart} className={`px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 ${btnColor}`}>
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => scrollTo('stories')} className="px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-all">
              See Success Stories
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 mt-8">
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face',
              ].map((url, i) => (
                <img key={i} src={url} className="w-8 h-8 rounded-full border-2 border-black object-cover" alt="user" />
              ))}
            </div>
            <p className="text-sm text-slate-400"><span className="text-white font-bold">10,000+</span> matches made in Cameroon</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="relative z-10 flex-1 w-full max-w-lg">
          <div className="relative">
            <div className="rounded-[40px] overflow-hidden border-8 border-white/5 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src={heroImage} alt="Happy Couple in Cameroon" className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-white/70">Success Story · Douala</p>
                <p className="font-serif text-2xl text-white">Amina &amp; Kevin, 2024</p>
              </div>
            </div>
            <div className={`absolute -bottom-8 -left-8 p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl ${isRoyal ? 'bg-slate-900/90' : 'bg-black/80'}`}>
              <p className="text-xs text-slate-400 mb-1">Compatibility Score</p>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${accent}`} />
                <span className="text-3xl font-black text-white">96%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 cursor-pointer z-20" onClick={() => scrollTo('stories')}>
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="stories" className={`py-24 px-6 ${isRoyal ? 'bg-slate-900/50' : 'bg-black/20'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Real Stories, Real Love</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From Douala to Bamenda — Vantage is connecting Cameroonians every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StoryCard image="https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=800&fit=crop" names="Elena & Marcus" city="Douala" quote="We matched on Vantage and knew instantly. The compatibility score wasn't lying!" theme={currentTheme} />
            <StoryCard image="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&fit=crop" names="David & Christine" city="Yaoundé" quote="Finally, an app that focuses on what actually matters. 2 years strong!" theme={currentTheme} />
            <StoryCard image="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&fit=crop" names="Priya & Raj" city="Bafoussam" quote="From a magic icebreaker to our wedding day. Thank you Vantage!" theme={currentTheme} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Why Choose Vantage?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Built for Cameroonians. Powered by AI. Focused on real connection.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<Shield className={`w-8 h-8 ${accent}`} />} title="Identity Verified" desc="Every profile is verified by photo ID. No bots, no fakes — just real people." theme={currentTheme} />
            <FeatureCard icon={<Heart className={`w-8 h-8 ${accent}`} />} title="AI Compatibility" desc="Our AI analyzes deep personality traits, not just surface-level interests." theme={currentTheme} />
            <FeatureCard icon={<MessageCircle className={`w-8 h-8 ${accent}`} />} title="Magic Icebreakers" desc="Never struggle with what to say. AI-crafted openers tailored to your match." theme={currentTheme} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`py-24 px-6 ${isRoyal ? 'bg-slate-900/40' : 'bg-black/20'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about Vantage Match.</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`rounded-2xl border border-white/8 overflow-hidden ${isRoyal ? 'bg-slate-900' : 'bg-[#1a0505]'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-5 text-left flex justify-between items-center gap-4">
                  <span className="font-bold text-white text-base">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-slate-400 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT → WhatsApp */}
      <section id="contact" className={`py-24 px-6 ${isRoyal ? 'bg-purple-900/10' : 'bg-rose-900/10'}`}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-5xl font-bold mb-6">Get in Touch</h2>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
              Have a question, a success story, or need support? Send us a message directly on WhatsApp — we reply fast! 🇨🇲
            </p>
            <div className="space-y-5">
              {[
                { icon: <Phone className="w-5 h-5" />, label: 'WhatsApp', value: '+237 657 960 690' },
                { icon: <Mail className="w-5 h-5" />, label: 'Email Us', value: 'hello@vantage.cm' },
                { icon: <MapPin className="w-5 h-5" />, label: 'Based In', value: 'Douala, Cameroon 🇨🇲' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border border-white/10 ${accentBg} bg-opacity-20`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">{item.label}</p>
                    <p className="text-lg font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Message Form */}
          <div className={`p-8 rounded-3xl border border-white/8 ${isRoyal ? 'bg-slate-900' : 'bg-[#1a0505]'}`}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Opening WhatsApp…</h3>
                  <p className="text-slate-400 text-center text-sm">Your message is pre-filled. Just tap Send in WhatsApp!</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleWhatsAppSend} className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Send via WhatsApp</p>
                      <p className="text-xs text-slate-400">We reply within minutes 🟢</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Your Name (optional)</label>
                    <input
                      type="text"
                      value={contactData.name}
                      onChange={e => setContactData(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Sofia"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Your Message *</label>
                    <textarea
                      value={contactData.message}
                      onChange={e => setContactData(p => ({ ...p, message: e.target.value }))}
                      required
                      rows={5}
                      placeholder="Hi Vantage! I have a question about..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 resize-none focus:outline-none focus:border-white/30 transition-colors text-white placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!contactData.message.trim()}
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isRoyal ? 'bg-gold-500 text-black' : 'bg-green-500 hover:bg-green-400 text-white'}`}
                  >
                    <Send className="w-5 h-5" />
                    Send on WhatsApp
                  </button>
                  <p className="text-center text-slate-600 text-xs">Opens WhatsApp with your message pre-filled.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <p className="text-slate-500 text-sm font-serif italic">
          © {new Date().getFullYear()} Vantage Match · Cameroon 🇨🇲 · Elevate your love life.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, theme }: { icon: React.ReactNode; title: string; desc: string; theme: Theme }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className={`p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors ${theme === 'royal' ? 'bg-slate-900' : 'bg-[#1a0505]'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${theme === 'royal' ? 'bg-slate-800' : 'bg-rose-950'}`}>{icon}</div>
    <h3 className="font-serif font-bold text-2xl text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

const StoryCard = ({ image, names, city, quote, theme }: { image: string; names: string; city: string; quote: string; theme: Theme }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
    className={`rounded-3xl overflow-hidden border border-white/5 group ${theme === 'royal' ? 'bg-slate-900' : 'bg-[#1a0505]'}`}>
    <div className="h-64 overflow-hidden relative">
      <img src={image} alt={names} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-3 left-4">
        <span className="text-xs text-white/60 font-bold uppercase tracking-wide">📍 {city}</span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="font-serif text-xl font-bold text-white mb-2">{names}</h3>
      <p className="text-slate-400 italic leading-relaxed text-sm">"{quote}"</p>
    </div>
  </motion.div>
);

export default LandingPage;
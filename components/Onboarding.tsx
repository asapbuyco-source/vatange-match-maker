import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { Camera, ArrowRight, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const INTERESTS_LIST = [
  'Tech', 'Travel', 'Art', 'Music', 'Fitness', 'Foodie', 'Gaming', 'Nature', 'Fashion', 'Movies', 'Reading', 'Dancing'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    job: '',
    bio: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests(prev => [...prev, interest]);
      }
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.age) return;

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: formData.name,
      age: parseInt(formData.age),
      job: formData.job || 'Dreamer',
      bio: formData.bio || 'Ready to explore.',
      imageUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=6B21A8&color=fff&size=400`, 
      interests: selectedInterests.length > 0 ? selectedInterests : ['General']
    };

    onComplete(newProfile);
  };

  return (
    <div 
      className="h-full w-full flex flex-col bg-slate-950 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url("https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1000&auto=format&fit=crop")'
      }}
    >
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide backdrop-blur-sm">
        <div className="max-w-md mx-auto w-full pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 mt-4"
          >
            <h2 className="text-3xl font-serif font-bold text-white mb-2">Create Profile</h2>
            <p className="text-slate-400 text-sm">Tell us a bit about yourself to find your best match.</p>
          </motion.div>

          <div className="space-y-6">
            {/* Photo Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-black/40 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-gold-500 hover:text-gold-500 transition-colors group backdrop-blur-md">
                <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-wide">Add Photo</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 focus:bg-black/70 outline-none transition-all placeholder:text-slate-600 backdrop-blur-sm"
                  placeholder="e.g. Alex"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 focus:bg-black/70 outline-none transition-all placeholder:text-slate-600 backdrop-blur-sm"
                    placeholder="25"
                  />
                </div>
                 <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Job Title</label>
                  <input 
                    type="text" 
                    value={formData.job}
                    onChange={e => setFormData({...formData, job: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 focus:bg-black/70 outline-none transition-all placeholder:text-slate-600 backdrop-blur-sm"
                    placeholder="e.g. Artist"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 focus:bg-black/70 outline-none transition-all h-24 resize-none placeholder:text-slate-600 backdrop-blur-sm"
                  placeholder="What makes you tick?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Interests (Max 5)</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        selectedInterests.includes(interest)
                          ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                          : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/30 hover:bg-black/60'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / CTA Area */}
      <div className="p-6 bg-black/80 border-t border-white/10 absolute bottom-0 w-full backdrop-blur-md">
         <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.age}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              !formData.name || !formData.age
                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                : 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 hover:bg-rose-500'
            }`}
          >
            Start Matching <ArrowRight className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};

export default Onboarding;
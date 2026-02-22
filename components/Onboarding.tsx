import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CAMEROON_CITIES } from '../types';
import { Camera, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadProfilePhoto } from '../services/cloudinaryService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const INTERESTS_LIST = [
  'Tech', 'Travel', 'Art', 'Music', 'Fitness', 'Foodie', 'Gaming', 'Nature',
  'Fashion', 'Movies', 'Reading', 'Dancing', 'Football', 'Photography', 'Business', 'Spirituality'
];

const STEPS = ['account', 'photos', 'interests', 'location'] as const;
type Step = typeof STEPS[number];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('account');
  const [formData, setFormData] = useState({ name: '', age: '', job: '', bio: '', gender: '' as 'male' | 'female' | 'other' | '' });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [city, setCity] = useState('Douala');
  const [ageError, setAgeError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = STEPS.indexOf(step);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadError('Photo must be under 10 MB'); return; }
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file'); return; }
    setUploadError('');
    setSelectedFile(file);
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) setImageUrl(ev.target.result as string); };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else if (selectedInterests.length < 6) {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const validateAccount = () => {
    const age = parseInt(formData.age);
    if (!formData.name.trim()) return false;
    if (isNaN(age) || age < 18) { setAgeError('You must be at least 18 years old to use Vantage.'); return false; }
    if (age > 90) { setAgeError('Please enter a valid age.'); return false; }
    setAgeError('');
    return true;
  };

  const goNext = async () => {
    if (step === 'account' && !validateAccount()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex]);
    else await handleSubmit();
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(STEPS[prevIndex]);
  };

  const handleSubmit = async () => {
    setUploading(true);
    let finalImageUrl = imageUrl;

    // Upload photo to Cloudinary/Firebase if a file was selected
    if (selectedFile) {
      try {
        const result = await uploadProfilePhoto(selectedFile);
        finalImageUrl = result.url;
      } catch (err) {
        console.warn('[Onboarding] Photo upload failed, using local preview:', err);
        // Keep local base64 preview as fallback
      }
    }

    const displayName = formData.name.trim();
    if (!finalImageUrl) {
      finalImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FD297B&color=fff&size=400&bold=true`;
    }

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: displayName,
      age: parseInt(formData.age),
      job: formData.job || 'Professional',
      bio: formData.bio || 'Ready to find a genuine connection.',
      imageUrl: finalImageUrl,
      interests: selectedInterests.length > 0 ? selectedInterests : ['General'],
      location: city,
      gender: formData.gender || 'other',
      verified: false,
    };
    setUploading(false);
    onComplete(newProfile);
  };

  const canProceed = () => {
    if (step === 'account') return formData.name.trim().length > 0 && formData.age !== '';
    if (step === 'photos') return true; // photo optional
    if (step === 'interests') return selectedInterests.length >= 2;
    return true;
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Step indicator dots */}
      <div className="flex items-center px-5 pt-12 pb-2 gap-2">
        {currentStepIndex > 0 ? (
          <button onClick={goBack} className="p-2 rounded-full hover:bg-white/5 text-slate-400 mr-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : <div className="w-9" />}
        <div className="flex-1 flex gap-1.5 mx-2">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-400 ${i <= currentStepIndex ? 'bg-rose-500' : 'bg-slate-800'}`} />
          ))}
        </div>
        <div className="w-9 text-right">
          <span className="text-xs text-slate-500 font-bold">{currentStepIndex + 1}/{STEPS.length}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="px-5 pt-6 pb-36"
          >

            {/* STEP 1: Account */}
            {step === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">Create your profile</h2>
                  <p className="text-slate-400 text-sm">Tell us a bit about yourself.</p>
                </div>
                <div className="space-y-4">
                  <Field label="First Name *" value={formData.name} onChange={v => setFormData(p => ({ ...p, name: v }))} placeholder="e.g. Sofia" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field label="Age *" value={formData.age} onChange={v => { setFormData(p => ({ ...p, age: v })); setAgeError(''); }} placeholder="24" type="number" />
                      {ageError && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-400">{ageError}</p>
                        </div>
                      )}
                    </div>
                    <Field label="Job Title" value={formData.job} onChange={v => setFormData(p => ({ ...p, job: v }))} placeholder="e.g. Engineer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">I am a...</label>
                    <div className="flex gap-2">
                      {(['male', 'female', 'other'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => setFormData(p => ({ ...p, gender: g }))}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${formData.gender === g
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/20'
                            : 'bg-slate-900 text-slate-400 border-white/10'
                            }`}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                      maxLength={300}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500/70 outline-none h-24 resize-none placeholder:text-slate-600"
                      placeholder="What makes you unique? (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Photos */}
            {step === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">Add your best photo</h2>
                  <p className="text-slate-400 text-sm">Profiles with photos get 5× more matches.</p>
                </div>
                <div className="relative">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  {imageUrl ? (
                    <div className="relative group">
                      <img src={imageUrl} className="w-full h-80 object-cover rounded-2xl border border-white/10" alt="Preview" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <div className="flex flex-col items-center text-white">
                          <Camera className="w-10 h-10 mb-2" />
                          <span className="font-bold">Change Photo</span>
                        </div>
                      </button>
                      <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-80 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-slate-500 hover:border-rose-500/50 hover:text-rose-400 transition-colors group"
                    >
                      <Camera className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-lg">Upload Photo</span>
                      <span className="text-sm mt-1">Tap to choose from gallery</span>
                    </button>
                  )}
                </div>
                {uploadError && <p className="text-red-400 text-xs text-center">{uploadError}</p>}
                <p className="text-center text-slate-600 text-xs">Photo uploaded securely. You can skip and add later.</p>
              </div>
            )}

            {/* STEP 3: Interests */}
            {step === 'interests' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">Your interests</h2>
                  <p className="text-slate-400 text-sm">Pick at least 2 things you love (max 6).</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {INTERESTS_LIST.map(interest => {
                    const selected = selectedInterests.includes(interest);
                    return (
                      <motion.button
                        key={interest}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${selected
                          ? 'bg-rose-600 text-white border-rose-500 shadow-lg'
                          : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                      >
                        {interest}
                      </motion.button>
                    );
                  })}
                </div>
                <p className={`text-center text-sm font-bold ${selectedInterests.length >= 2 ? 'text-green-400' : 'text-slate-500'}`}>
                  {selectedInterests.length}/6 selected{selectedInterests.length >= 2 && ' ✓'}
                </p>
              </div>
            )}

            {/* STEP 4: Location */}
            {step === 'location' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">Where are you?</h2>
                  <p className="text-slate-400 text-sm">We'll show you matches in your city first.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CAMEROON_CITIES.map(c => (
                    <motion.button
                      key={c}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCity(c)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold text-left transition-all border ${city === c
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      {city === c && <span className="mr-1.5">📍</span>}{c}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-slate-950/95 border-t border-white/5 backdrop-blur-md">
        <motion.button
          onClick={goNext}
          disabled={!canProceed() || uploading}
          whileTap={{ scale: canProceed() ? 0.96 : 1 }}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${canProceed() && !uploading
            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-xl shadow-rose-900/30'
            : 'bg-white/8 text-slate-500 cursor-not-allowed'
            }`}
        >
          {uploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading photo...</>
          ) : (
            <>{step === 'location' ? 'Start Matching' : 'Continue'} <ArrowRight className="w-5 h-5" /></>
          )}
        </motion.button>
        {step === 'photos' && !uploading && (
          <button onClick={goNext} className="w-full text-center text-sm text-slate-500 mt-3 font-medium">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500/70 outline-none transition-all placeholder:text-slate-600"
    />
  </div>
);

export default Onboarding;
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CAMEROON_CITIES, RelationshipGoal, RELATIONSHIP_GOALS, INTEREST_TAGS } from '../types';
import { Camera, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Sparkles, Shield, Heart } from 'lucide-react';
import { uploadProfilePhoto } from '../services/cloudinaryService';
import { useLanguage } from '../i18n/LanguageContext';
import VoiceIntro from './VoiceIntro';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const INTERESTS_LIST = INTEREST_TAGS;

const STEPS = ['welcome', 'account', 'photos', 'interests', 'intent', 'location'] as const;
type Step = typeof STEPS[number];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('welcome');
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [formData, setFormData] = useState({ name: '', age: '', job: '', university: '', bio: '', gender: '' as 'male' | 'female' | 'other' | '', intent: '' as RelationshipGoal | '' });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [city, setCity] = useState('Douala');
  const [ageError, setAgeError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = STEPS.indexOf(step);
  const slides = t.onboarding.welcome_slides;

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
    if (isNaN(age) || age < 18) { setAgeError(t.onboarding.account.age_error); return false; }
    if (age > 90) { setAgeError(t.onboarding.account.age_invalid); return false; }
    setAgeError('');
    return true;
  };

  const goNext = async () => {
    if (step === 'welcome') {
      if (welcomeIndex < slides.length - 1) {
        setWelcomeIndex(prev => prev + 1);
        return;
      }
    }
    if (step === 'account' && !validateAccount()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex]);
    else await handleSubmit();
  };

  const goBack = () => {
    if (step === 'welcome' && welcomeIndex > 0) {
      setWelcomeIndex(prev => prev - 1);
      return;
    }
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
      if (STEPS[prevIndex] === 'welcome') setWelcomeIndex(slides.length - 1);
    }
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
      university: formData.university || undefined,
      bio: formData.bio || 'Ready to find a genuine connection.',
      imageUrl: finalImageUrl,
      interests: selectedInterests.length > 0 ? selectedInterests : ['General'],
      location: city,
      gender: formData.gender || 'other',
      relationship_goal: formData.intent ? formData.intent : undefined,
      voice_intro: voiceUrl || undefined,
      profile_photos: finalImageUrl ? [finalImageUrl] : [],
      verified: false,
      verified_status: false,
    };
    setUploading(false);
    onComplete(newProfile);
  };

  const canProceed = () => {
    if (step === 'welcome') return true;
    if (step === 'account') return formData.name.trim().length > 0 && formData.age !== '' && formData.gender !== '';
    if (step === 'photos') return true; // photo optional
    if (step === 'interests') return selectedInterests.length >= 2;
    if (step === 'intent') return formData.intent !== '';
    return true;
  };

  const WelcomeIcon = [Sparkles, Heart, Shield][welcomeIndex];

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Step indicator dots */}
      <div className="flex items-center px-5 pt-12 pb-2 gap-2">
        {(currentStepIndex > 0 || welcomeIndex > 0) ? (
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
            key={step === 'welcome' ? `welcome-${welcomeIndex}` : step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="px-5 pt-6 pb-36"
          >
            {/* STEP 0: Welcome Slides */}
            {step === 'welcome' && (
              <div className="flex flex-col items-center text-center space-y-8 pt-12">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-rose-900/40 transform rotate-6">
                  <WelcomeIcon className="w-12 h-12 text-white transform -rotate-6" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif font-bold text-white tracking-tight">{slides[welcomeIndex].title}</h2>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
                    {slides[welcomeIndex].description}
                  </p>
                </div>
                {/* Visual dots for sub-slides */}
                <div className="flex gap-2 justify-center">
                  {slides.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === welcomeIndex ? 'w-6 bg-rose-500' : 'w-1.5 bg-slate-800'}`} />
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: Account */}
            {step === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">{t.onboarding.account.title}</h2>
                  <p className="text-slate-400 text-sm">{t.onboarding.account.subtitle}</p>
                </div>
                <div className="space-y-4">
                  <Field label={t.onboarding.account.name} value={formData.name} onChange={v => setFormData(p => ({ ...p, name: v }))} placeholder={t.onboarding.account.name_placeholder} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Field label={t.onboarding.account.age} value={formData.age} onChange={v => { setFormData(p => ({ ...p, age: v })); setAgeError(''); }} placeholder={t.onboarding.account.age_placeholder} type="number" />
                      {ageError && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-400">{ageError}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Field label={t.onboarding.account.job} value={formData.job} onChange={v => setFormData(p => ({ ...p, job: v }))} placeholder={t.onboarding.account.job_placeholder} />
                    </div>
                  </div>
                  <div>
                    <Field label={t.onboarding.account.university} value={formData.university} onChange={v => setFormData(p => ({ ...p, university: v }))} placeholder={t.onboarding.account.university_placeholder} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">{t.onboarding.account.gender_label}</label>
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
                          {g === 'male' ? t.onboarding.account.gender_male : g === 'female' ? t.onboarding.account.gender_female : t.onboarding.account.gender_other}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">{t.onboarding.account.bio}</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                      maxLength={300}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500/70 outline-none h-24 resize-none placeholder:text-slate-600"
                      placeholder={t.onboarding.account.bio_placeholder}
                    />
                  </div>

                  {/* Voice Intro */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Voice Intro (Optional)</label>
                    <VoiceIntro
                      audioUrl={voiceUrl || undefined}
                      onUpload={async (file) => {
                        // In reality, upload to Firebase Storage or Cloudinary
                        const res = await uploadProfilePhoto(file); // reuse cloudinary uploader for audio if supported, or fake it
                        setVoiceUrl(res.url);
                        return res.url;
                      }}
                      onRemove={() => setVoiceUrl('')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Photos */}
            {step === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">{t.onboarding.photos.title}</h2>
                  <p className="text-slate-400 text-sm">{t.onboarding.photos.subtitle}</p>
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
                          <span className="font-bold">{t.onboarding.photos.change}</span>
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
                      <span className="font-bold text-lg">{t.onboarding.photos.upload_label}</span>
                      <span className="text-sm mt-1">{t.onboarding.photos.upload_sub}</span>
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
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">{t.onboarding.interests.title}</h2>
                  <p className="text-slate-400 text-sm">{t.onboarding.interests.subtitle}</p>
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
                  {selectedInterests.length}/6 {t.onboarding.interests.selected}{selectedInterests.length >= 2 && ' ✓'}
                </p>
              </div>
            )}

            {/* STEP 4.5: Relationship Intent */}
            {step === 'intent' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">{t.onboarding.intent.title}</h2>
                  <p className="text-slate-400 text-sm">{t.onboarding.intent.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {RELATIONSHIP_GOALS.map(goal => (
                    <motion.button
                      key={goal.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(p => ({ ...p, intent: goal.value }))}
                      className={`p-4 rounded-2xl flex items-center justify-between text-left transition-all border ${formData.intent === goal.value
                        ? 'bg-rose-600/20 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-white'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.emoji}</span>
                        <span className="font-bold">{t.onboarding.intent[goal.value as keyof typeof t.onboarding.intent]}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.intent === goal.value ? 'border-rose-500' : 'border-slate-600'}`}>
                        {formData.intent === goal.value && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Location */}
            {step === 'location' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-1">{t.onboarding.location.title}</h2>
                  <p className="text-slate-400 text-sm">{t.onboarding.location.subtitle}</p>
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
            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
          ) : (
            <>{step === 'welcome' ? slides[welcomeIndex].cta : step === 'location' ? t.onboarding.cta_start : t.onboarding.cta_continue} <ArrowRight className="w-5 h-5" /></>
          )}
        </motion.button>
        {step === 'photos' && !uploading && (
          <button onClick={goNext} className="w-full text-center text-sm text-slate-500 mt-3 font-medium">
            {t.onboarding.photos.skip}
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
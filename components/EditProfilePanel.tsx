import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { UserProfile, Theme, RELATIONSHIP_GOALS, INTEREST_TAGS } from '../types';
import { uploadProfilePhoto } from '../services/cloudinaryService';
import VoiceIntro from './VoiceIntro';

interface EditProfilePanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: UserProfile;
    onSave: (updated: UserProfile) => void;
    theme: Theme;
}

const INTERESTS_LIST = INTEREST_TAGS;

const EditProfilePanel: React.FC<EditProfilePanelProps> = ({ isOpen, onClose, currentUser, onSave, theme }) => {
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        age: currentUser.age?.toString() || '',
        job: currentUser.job || '',
        university: currentUser.university || '',
        intent: currentUser.relationship_goal || '',
        bio: currentUser.bio || '',
    });
    const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.interests || []);
    const [imageUrl, setImageUrl] = useState(currentUser.imageUrl || '');
    const [photos, setPhotos] = useState<string[]>(currentUser.profile_photos || []);
    const [voiceUrl, setVoiceUrl] = useState(currentUser.voice_intro || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const multiFileInputRef = useRef<HTMLInputElement>(null);

    const accent = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
    const accentBg = theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500';
    const accentBorder = theme === 'royal' ? 'border-gold-500 bg-gold-500/10' : 'border-rose-500 bg-rose-500/10';

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
        } else {
            if (selectedInterests.length < 6) setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const handleMultiPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        let validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
        const availableSlots = 6 - photos.length;
        validFiles = validFiles.slice(0, availableSlots);

        if (!validFiles.length) { setUploadError('Invalid files or no slots left.'); return; }

        setUploading(true);
        try {
            const uploadedUrls = await Promise.all(validFiles.map(f => uploadProfilePhoto(f)));
            setPhotos(prev => [...prev, ...uploadedUrls.map(res => res.url)]);
        } catch (err) {
            console.error('Multi photo upload error:', err);
            setUploadError('Failed to upload some photos.');
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setUploading(true);
        let finalImageUrl = imageUrl;

        if (selectedFile) {
            try {
                const result = await uploadProfilePhoto(selectedFile);
                finalImageUrl = result.url;
            } catch (err) {
                console.warn('[EditProfile] Photo upload failed, keeping current photo:', err);
                setUploadError('Photo upload failed — other changes saved.');
            }
        }

        const updated: UserProfile = {
            ...currentUser,
            name: formData.name || currentUser.name,
            age: parseInt(formData.age) || currentUser.age,
            job: formData.job || currentUser.job,
            university: formData.university || currentUser.university,
            bio: formData.bio || currentUser.bio,
            interests: selectedInterests.length > 0 ? selectedInterests : currentUser.interests,
            relationship_goal: formData.intent ? (formData.intent as any) : currentUser.relationship_goal,
            imageUrl: finalImageUrl,
            profile_photos: photos,
            voice_intro: voiceUrl,
        };
        setUploading(false);
        onSave(updated);
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="edit-profile"
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                        <h2 className="font-bold text-lg text-white">Edit Profile</h2>
                        <button
                            onClick={handleSave}
                            disabled={!formData.name || uploading}
                            className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${formData.name && !uploading ? `${accentBg} text-white` : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : 'Save'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <div className="px-5 py-6 space-y-6">

                            {/* Photo */}
                            <div className="flex justify-center">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10">
                                        <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    {uploading && (
                                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60">
                                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Camera className="w-7 h-7 text-white mb-1" />
                                        <span className="text-[10px] text-white font-bold uppercase">Change</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full ${accentBg} border-2 border-slate-950 flex items-center justify-center shadow`}
                                    >
                                        <Camera className="w-4 h-4 text-white" />
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                                </div>
                            </div>
                            {uploadError && <p className="text-center text-red-400 text-xs">{uploadError}</p>}

                            {/* Fields */}
                            <div className="space-y-4">
                                <FormField label="Name" value={formData.name} onChange={(v) => setFormData(p => ({ ...p, name: v }))} placeholder="Your name" theme={theme} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Age" value={formData.age} onChange={(v) => setFormData(p => ({ ...p, age: v }))} placeholder="25" type="number" theme={theme} />
                                    <FormField label="Job Title" value={formData.job} onChange={(v) => setFormData(p => ({ ...p, job: v }))} placeholder="e.g. Engineer" theme={theme} />
                                </div>
                                <FormField label="University / School" value={formData.university} onChange={(v) => setFormData(p => ({ ...p, university: v }))} placeholder="e.g. University of Yaoundé 1" theme={theme} />

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Relationship Intent</label>
                                    <select
                                        value={formData.intent}
                                        onChange={(e) => setFormData(p => ({ ...p, intent: e.target.value }))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select Intent</option>
                                        {RELATIONSHIP_GOALS.map(g => (
                                            <option key={g.value} value={g.value}>{g.emoji} {g.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                                        maxLength={300}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 outline-none transition-all h-28 resize-none placeholder:text-slate-600"
                                        placeholder="Tell the world what makes you unique..."
                                    />
                                    <div className="text-right text-xs text-slate-600 mt-1">{formData.bio.length}/300</div>
                                </div>
                            </div>

                            {/* Voice Intro */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Voice Intro</label>
                                <VoiceIntro
                                    audioUrl={voiceUrl || undefined}
                                    onUpload={async (file) => {
                                        const res = await uploadProfilePhoto(file); // reuse cloudinary uploader for audio
                                        setVoiceUrl(res.url);
                                        return res.url;
                                    }}
                                    onRemove={() => setVoiceUrl('')}
                                />
                            </div>

                            {/* Additional Photos */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold uppercase text-slate-500 ml-1">Additional Photos (Max 6)</label>
                                    <span className={`text-xs font-bold ${accent}`}>{photos.length}/6</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {photos.map((photo, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                            <img src={photo} alt="Profile extra" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                            >
                                                <X className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {photos.length < 6 && (
                                        <button
                                            onClick={() => multiFileInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 hover:border-white/40 hover:text-slate-300 transition-colors"
                                        >
                                            <Camera className="w-6 h-6 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Add Photo</span>
                                        </button>
                                    )}
                                </div>
                                <input ref={multiFileInputRef} type="file" accept="image/*" multiple onChange={handleMultiPhotoSelect} className="hidden" />
                            </div>

                            {/* Interests */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold uppercase text-slate-500 ml-1">Interests (Max 6)</label>
                                    <span className={`text-xs font-bold ${accent}`}>{selectedInterests.length}/6</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS_LIST.map(interest => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedInterests.includes(interest)
                                                ? `${accentBorder} text-white`
                                                : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'}`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save CTA */}
                            <button
                                onClick={handleSave}
                                disabled={!formData.name || uploading}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${formData.name && !uploading
                                    ? `${accentBg} text-white shadow-lg`
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            >
                                {uploading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                                ) : saved ? (
                                    <><CheckCircle className="w-5 h-5" /> Saved!</>
                                ) : (
                                    <>Save Changes <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; theme: Theme }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:border-white/30 outline-none transition-all placeholder:text-slate-600"
        />
    </div>
);

export default EditProfilePanel;

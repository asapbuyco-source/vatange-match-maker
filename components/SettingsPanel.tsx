import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, MapPin, Users, Sliders, ChevronRight, LogOut, Lock, FileText, Bell } from 'lucide-react';
import { FilterPreferences, Theme, CAMEROON_CITIES, DISTANCE_OPTIONS, RELATIONSHIP_GOALS } from '../types';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterPreferences;
    onFiltersChange: (filters: FilterPreferences) => void;
    theme: Theme;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, filters, onFiltersChange, theme }) => {
    const [localFilters, setLocalFilters] = useState<FilterPreferences>(filters);
    const [notificationsOn, setNotificationsOn] = useState(true);
    const accent = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
    const accentBg = theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500';
    const gradientTrack = theme === 'royal' ? '#eab308' : '#FD297B';

    const handleSave = () => {
        onFiltersChange(localFilters);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="settings-panel"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Settings className={`w-5 h-5 ${accent}`} />
                            <h2 className="font-bold text-lg text-white">Discovery Settings</h2>
                        </div>
                        <button
                            onClick={handleSave}
                            className={`text-sm font-bold px-4 py-1.5 rounded-full ${accentBg} text-white`}
                        >
                            Save
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6 space-y-8">

                        {/* Location */}
                        <Section title="Location" icon={<MapPin className="w-4 h-4" />} theme={theme}>
                            <select
                                value={localFilters.city}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, city: e.target.value }))}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-white/30 transition-colors"
                            >
                                {CAMEROON_CITIES.map(city => (
                                    <option key={city} value={city} className="bg-slate-800">{city}</option>
                                ))}
                            </select>
                        </Section>

                        {/* Distance */}
                        <Section title="Maximum Distance" icon={<Sliders className="w-4 h-4" />} theme={theme}>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400 text-sm">Up to</span>
                                    <span className="text-white font-bold text-lg">{localFilters.maxDistance} km</span>
                                </div>
                                <div className="flex bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                                    {DISTANCE_OPTIONS.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setLocalFilters(prev => ({ ...prev, maxDistance: d }))}
                                            className={`flex-1 min-w-[50px] py-1.5 text-sm font-bold rounded-lg transition-all ${localFilters.maxDistance === d
                                                ? `${accentBg} text-white shadow-md`
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        {/* Relationship Intent */}
                        <Section title="Looking For" icon={<Users className="w-4 h-4" />} theme={theme}>
                            <select
                                value={localFilters.relationship_goal || 'all'}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, relationship_goal: e.target.value as any }))}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                            >
                                <option value="all">Open to all</option>
                                {RELATIONSHIP_GOALS.map(goal => (
                                    <option key={goal.value} value={goal.value} className="bg-slate-800">
                                        {goal.emoji} {goal.label}
                                    </option>
                                ))}
                            </select>
                        </Section>

                        {/* Age Range */}
                        <Section title="Age Range" icon={<Users className="w-4 h-4" />} theme={theme}>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Minimum age</span>
                                        <span className="text-white font-bold">{localFilters.ageMin}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={18}
                                        max={localFilters.ageMax - 1}
                                        value={localFilters.ageMin}
                                        onChange={(e) => setLocalFilters(prev => ({ ...prev, ageMin: Number(e.target.value) }))}
                                        className="w-full h-1.5 appearance-none bg-slate-700 rounded-full cursor-pointer"
                                        style={{ accentColor: gradientTrack }}
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Maximum age</span>
                                        <span className="text-white font-bold">{localFilters.ageMax}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={localFilters.ageMin + 1}
                                        max={70}
                                        value={localFilters.ageMax}
                                        onChange={(e) => setLocalFilters(prev => ({ ...prev, ageMax: Number(e.target.value) }))}
                                        className="w-full h-1.5 appearance-none bg-slate-700 rounded-full cursor-pointer"
                                        style={{ accentColor: gradientTrack }}
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Gender Preference */}
                        <Section title="Show Me" icon={<Users className="w-4 h-4" />} theme={theme}>
                            <div className="flex gap-2">
                                {(['everyone', 'male', 'female'] as const).map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setLocalFilters(prev => ({ ...prev, genderPreference: g }))}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${localFilters.genderPreference === g
                                            ? `${accentBg} text-white border-transparent`
                                            : 'border-white/10 text-slate-400 hover:border-white/20'
                                            }`}
                                    >
                                        {g === 'everyone' ? 'Everyone' : g === 'male' ? 'Men' : 'Women'}
                                    </button>
                                ))}
                            </div>
                        </Section>

                        {/* Notifications */}
                        <Section title="Notifications" icon={<Bell className="w-4 h-4" />} theme={theme}>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-slate-300 text-sm">New matches &amp; messages</span>
                                <button
                                    onClick={() => setNotificationsOn(v => !v)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notificationsOn ? accentBg : 'bg-slate-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: notificationsOn ? 24 : 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                                    />
                                </button>
                            </div>
                        </Section>

                        {/* Account */}
                        <Section title="Account" icon={<Settings className="w-4 h-4" />} theme={theme}>
                            <div className="space-y-1">
                                {[
                                    { icon: <Lock className="w-4 h-4" />, label: 'Privacy Policy' },
                                    { icon: <FileText className="w-4 h-4" />, label: 'Terms of Service' },
                                    { icon: <LogOut className="w-4 h-4 text-red-400" />, label: 'Log Out', danger: true },
                                ].map(item => (
                                    <button
                                        key={item.label}
                                        className={`w-full flex items-center gap-3 py-3 px-1 rounded-xl hover:bg-white/5 transition-colors ${item.danger ? 'text-red-400' : 'text-slate-300'}`}
                                    >
                                        {item.icon}
                                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                    </button>
                                ))}
                            </div>
                        </Section>

                        <p className="text-center text-xs text-slate-600 pb-4">
                            Amoura · Cameroon · v2.0.0
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; theme: Theme }> = ({ title, icon, children, theme }) => {
    const accent = theme === 'royal' ? 'text-gold-500' : 'text-rose-500';
    return (
        <div>
            <div className={`flex items-center gap-2 mb-3 ${accent}`}>
                {icon}
                <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
            </div>
            {children}
        </div>
    );
};

export default SettingsPanel;

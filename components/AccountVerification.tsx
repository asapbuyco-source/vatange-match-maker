import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, Phone, AlertCircle, ChevronRight, Lock, X, Eye } from 'lucide-react';
import { Theme } from '../types';
import { processVerificationPayment } from '../services/fapshiService';
import { useLanguage } from '../i18n/LanguageContext';

interface AccountVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: () => void;
    userName: string;
    userId?: string;
    theme: Theme;
}

type VerifStep = 'explain' | 'phone' | 'paying' | 'success' | 'error';

const AccountVerification: React.FC<AccountVerificationProps> = ({
    isOpen, onClose, onVerified, userName, userId, theme,
}) => {
    const { language } = useLanguage();
    const [step, setStep] = useState<VerifStep>('explain');
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [transId, setTransId] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const accent = theme === 'royal' ? '#eab308' : '#FF4B6E';
    const accentBg = theme === 'royal' ? 'bg-gold-500' : 'bg-rose-500';
    const accentText = theme === 'royal' ? 'text-gold-400' : 'text-rose-400';
    const accentBorder = theme === 'royal' ? 'border-gold-500/40' : 'border-rose-500/40';

    const isFr = language === 'fr';

    const copy = {
        title: isFr ? 'Vérification du Compte' : 'Account Verification',
        badge: isFr ? 'Gratuit après votre premier match' : 'Free after your first match',
        why_title: isFr ? 'Pourquoi 100 XAF ?' : 'Why 100 XAF?',
        why_bullets: isFr
            ? [
                '✅ Confirme que vous êtes une vraie personne, pas un bot',
                '✅ Obtient votre badge ✓ Vérifié affiché sur votre profil',
                '✅ Vous donne priorité dans les suggestions de matchs',
                '✅ Protège la communauté contre les faux profils',
                '💚 Montant remboursé sur votre premier match réussi',
            ]
            : [
                '✅ Confirms you are a real person, not a bot',
                '✅ Earns your ✓ Verified badge displayed on your profile',
                '✅ Gives you priority ranking in match suggestions',
                '✅ Protects the community from fake profiles',
                '💚 Amount refunded on your first successful match',
            ],
        how_title: isFr ? 'Comment ça marche ?' : 'How does it work?',
        how_steps: isFr
            ? ['Entrez votre numéro MTN MoMo ou Orange Money', 'Approuvez la demande USSD de 100 XAF sur votre téléphone', 'Votre badge Vérifié est activé instantanément']
            : ['Enter your MTN MoMo or Orange Money number', 'Approve the 100 XAF USSD push on your phone', 'Your Verified badge is activated instantly'],
        security: isFr
            ? '🔒 Traitement sécurisé par Fapshi · Vos données sunt protégées par cryptage de niveau bancaire'
            : '🔒 Secure processing by Fapshi · Your data is protected by bank-level encryption',
        cta: isFr ? 'Vérifier mon compte →' : 'Verify my account →',
        skip: isFr ? 'Plus tard' : 'Not now',
        phone_label: isFr ? 'Numéro Mobile Money (+237)' : 'Mobile Money Number (+237)',
        phone_placeholder: '6XXXXXXXX',
        phone_hint: isFr ? 'MTN MoMo (65x, 67x, 68x) · Orange Money (69x, 55x-57x)' : 'MTN MoMo (65x, 67x, 68x) · Orange Money (69x, 55x-57x)',
        phone_error: isFr ? 'Entrez un numéro camerounais valide à 9 chiffres commençant par 6 ou 7' : 'Enter a valid 9-digit Cameroon number starting with 6 or 7',
        pay_cta: isFr ? 'Payer 100 XAF →' : 'Pay 100 XAF →',
        back: isFr ? '← Retour' : '← Back',
        paying_title: isFr ? 'En attente de votre approbation…' : 'Waiting for your approval…',
        paying_desc: isFr
            ? 'Une demande USSD de 100 XAF a été envoyée au +237' + phone + '. Suivez les instructions sur votre téléphone pour approuver.'
            : 'A 100 XAF USSD request has been sent to +237' + phone + '. Follow the prompt on your phone to approve.',
        paying_steps: isFr
            ? ['📲 Ouvrez le menu USSD sur votre téléphone', '✔️ Approuvez la demande de paiement de 100 XAF', '⏳ Retour automatique une fois confirmé']
            : ['📲 Open the USSD menu on your phone', '✔️ Approve the 100 XAF payment request', '⏳ Returns automatically once confirmed'],
        success_title: isFr ? '🎉 Compte Vérifié !' : '🎉 Account Verified!',
        success_desc: isFr
            ? `Félicitations ${userName} ! Votre badge ✓ Vérifié est maintenant actif. Vous avez priorité dans les résultats de recherche.`
            : `Congratulations ${userName}! Your ✓ Verified badge is now live. You get priority placement in search results.`,
        trans_id: isFr ? 'ID Transaction' : 'Transaction ID',
        continue: isFr ? 'Commencer à Matcher ❤️' : 'Start Matching ❤️',
        error_title: isFr ? 'Paiement Échoué' : 'Payment Failed',
        retry: isFr ? 'Réessayer' : 'Try Again',
    };

    const validatePhone = (val: string) => /^[67]\d{8}$/.test(val);

    const handlePhoneSubmit = async () => {
        if (!validatePhone(phone)) {
            setPhoneError(copy.phone_error);
            inputRef.current?.focus();
            return;
        }
        setPhoneError('');
        setStep('paying');
        try {
            const result = await processVerificationPayment(phone, userName, userId);
            if (result.success) {
                setTransId(result.transId ?? 'VERIFIED');
                setStep('success');
            } else {
                setErrorMessage(result.error ?? 'Payment failed');
                setStep('error');
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Payment failed');
            setStep('error');
        }
    };

    const handleSuccess = () => {
        onVerified();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="verif-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md"
                        onClick={step !== 'paying' ? onClose : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        key="verif-modal"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        className="absolute bottom-0 left-0 right-0 z-50 bg-slate-950 rounded-t-3xl overflow-hidden max-h-[92vh] flex flex-col"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* ===== EXPLAIN STEP ===== */}
                        {step === 'explain' && (
                            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-8">
                                {/* Header */}
                                <div className="flex justify-between items-start pt-4 pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{ background: `${accent}22`, border: `1.5px solid ${accent}44` }}>
                                            <Shield className="w-6 h-6" style={{ color: accent }} />
                                        </div>
                                        <div>
                                            <h2 className="text-white font-black text-lg leading-tight">{copy.title}</h2>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                                {copy.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                {/* Why section */}
                                <div className={`rounded-2xl border ${accentBorder} p-4 mb-4`}
                                    style={{ background: `${accent}0a` }}>
                                    <h3 className={`font-black text-sm uppercase tracking-wide mb-3 ${accentText}`}>
                                        {copy.why_title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {copy.why_bullets.map((b, i) => (
                                            <li key={i} className="text-slate-300 text-sm leading-relaxed">{b}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* How it works */}
                                <div className="rounded-2xl bg-slate-900 border border-white/5 p-4 mb-4">
                                    <h3 className="font-black text-sm uppercase tracking-wide mb-3 text-slate-400">
                                        {copy.how_title}
                                    </h3>
                                    <ol className="space-y-3">
                                        {copy.how_steps.map((s, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 text-black"
                                                    style={{ background: accent }}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-slate-300 text-sm">{s}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Security note */}
                                <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">{copy.security}</p>

                                {/* CTA */}
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setStep('phone')}
                                    className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                                >
                                    <Shield className="w-5 h-5" />
                                    {copy.cta}
                                </motion.button>

                                <button onClick={onClose} className="w-full py-3 text-slate-500 text-sm font-medium mt-2">
                                    {copy.skip}
                                </button>
                            </div>
                        )}

                        {/* ===== PHONE STEP ===== */}
                        {step === 'phone' && (
                            <div className="flex-1 px-6 pb-8 pt-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={() => setStep('explain')} className="p-2 rounded-full hover:bg-white/10">
                                        <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
                                    </button>
                                    <h2 className="text-white font-black text-lg">{copy.title}</h2>
                                </div>

                                {/* Amount badge */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex flex-col items-center px-8 py-4 rounded-3xl"
                                        style={{ background: `${accent}15`, border: `2px solid ${accent}44` }}>
                                        <span className="text-5xl font-black" style={{ color: accent }}>100</span>
                                        <span className="text-white/60 text-sm font-bold mt-1">XAF</span>
                                    </div>
                                </div>

                                {/* Phone input */}
                                <label className="block text-slate-400 text-sm font-bold mb-2">{copy.phone_label}</label>
                                <div className={`flex items-center gap-3 bg-slate-900 border rounded-2xl px-4 py-4 mb-1 transition-colors ${phoneError ? 'border-red-500' : 'border-white/10 focus-within:border-white/30'}`}>
                                    <span className="text-white font-bold text-sm">+237</span>
                                    <div className="w-px h-5 bg-white/10" />
                                    <input
                                        ref={inputRef}
                                        type="tel"
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 9)); setPhoneError(''); }}
                                        placeholder={copy.phone_placeholder}
                                        maxLength={9}
                                        className="flex-1 bg-transparent text-white text-base font-medium placeholder:text-slate-600 focus:outline-none"
                                        autoFocus
                                    />
                                    {phone.length === 9 && (
                                        <Eye className="w-4 h-4 text-green-400" />
                                    )}
                                </div>
                                {phoneError && (
                                    <p className="text-red-400 text-xs mb-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> {phoneError}
                                    </p>
                                )}
                                <p className="text-slate-600 text-xs mb-8">{copy.phone_hint}</p>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handlePhoneSubmit}
                                    disabled={phone.length !== 9}
                                    className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                                >
                                    <Phone className="w-5 h-5" />
                                    {copy.pay_cta}
                                </motion.button>

                                <div className="flex items-center justify-center gap-1 mt-4 text-slate-600 text-xs">
                                    <Lock className="w-3 h-3" />
                                    <span>Powered by Fapshi · Bank-level security</span>
                                </div>
                            </div>
                        )}

                        {/* ===== PAYING STEP ===== */}
                        {step === 'paying' && (
                            <div className="flex-1 px-6 pb-8 pt-4 flex flex-col items-center text-center">
                                <div className="my-8">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 rounded-full border-4 border-transparent"
                                            style={{ borderTopColor: accent }}
                                        />
                                        <div className="absolute inset-3 rounded-full bg-slate-900 flex items-center justify-center">
                                            <Phone className="w-8 h-8" style={{ color: accent }} />
                                        </div>
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-2">{copy.paying_title}</h3>
                                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">{copy.paying_desc}</p>
                                    <div className="text-left space-y-3 bg-slate-900 rounded-2xl p-4 max-w-xs mx-auto">
                                        {copy.paying_steps.map((s, i) => (
                                            <p key={i} className="text-slate-300 text-sm">{s}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===== SUCCESS STEP ===== */}
                        {step === 'success' && (
                            <div className="flex-1 px-6 pb-8 pt-4 flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="my-8"
                                >
                                    <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
                                        style={{ background: `${accent}20`, border: `3px solid ${accent}` }}>
                                        <CheckCircle className="w-14 h-14" style={{ color: accent }} />
                                    </div>
                                    <h3 className="text-white font-black text-2xl mb-3">{copy.success_title}</h3>
                                    <p className="text-slate-300 text-sm max-w-xs leading-relaxed mb-4">{copy.success_desc}</p>
                                    {transId && (
                                        <p className="text-slate-600 text-xs">
                                            {copy.trans_id}: <span className="font-mono text-slate-500">{transId}</span>
                                        </p>
                                    )}
                                </motion.div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSuccess}
                                    className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                                >
                                    {copy.continue}
                                </motion.button>
                            </div>
                        )}

                        {/* ===== ERROR STEP ===== */}
                        {step === 'error' && (
                            <div className="flex-1 px-6 pb-8 pt-4 flex flex-col items-center text-center">
                                <div className="my-8">
                                    <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-6">
                                        <AlertCircle className="w-12 h-12 text-red-400" />
                                    </div>
                                    <h3 className="text-white font-black text-xl mb-2">{copy.error_title}</h3>
                                    <p className="text-red-400 text-sm max-w-xs leading-relaxed mb-6">{errorMessage}</p>
                                </div>

                                <button
                                    onClick={() => { setStep('phone'); setErrorMessage(''); }}
                                    className="w-full py-4 rounded-2xl font-black text-base text-white shadow-lg mb-3"
                                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                                >
                                    {copy.retry}
                                </button>
                                <button onClick={onClose} className="w-full py-3 text-slate-500 text-sm">
                                    {copy.skip}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AccountVerification;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, Loader2, Smartphone, Shield, Zap, Crown, ChevronRight } from 'lucide-react';
import { PaymentStatus, SUBSCRIPTION_PLANS, SubscriptionTier, SubscriptionPlan } from '../types';
import { processSubscriptionPayment } from '../services/fapshiService';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (tier: SubscriptionTier) => void;
    currentTier: SubscriptionTier;
}

const TIER_ICONS: Record<SubscriptionTier, React.ReactNode> = {
    free: <Shield className="w-5 h-5" />,
    plus: <Zap className="w-5 h-5" />,
    gold: <Star className="w-5 h-5 fill-current" />,
    platinum: <Crown className="w-5 h-5" />,
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess, currentTier }) => {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]); // Gold default
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'plans' | 'checkout'>('plans');

    const price = billingCycle === 'monthly'
        ? selectedPlan.monthlyPrice
        : selectedPlan.annualMonthlyPrice;

    // Cameroon phone validation (6xx, 7xx pattern — 9 digits total starting with 6 or 7)
    const isValidPhone = /^(6|7)\d{8}$/.test(phoneNumber.replace(/\s/g, ''));

    const handlePayment = async () => {
        if (!isValidPhone) {
            setError('Please enter a valid Cameroon number (e.g. 6XXXXXXXX)');
            return;
        }
        setStatus(PaymentStatus.PROCESSING);
        setError(null);
        try {
            const total = billingCycle === 'annual' ? price * 12 : price;
            const result = await processSubscriptionPayment(
                phoneNumber,
                selectedPlan.tier,
                total,
            );
            if (!result.success) throw new Error(result.error || 'Payment was declined.');
            setStatus(PaymentStatus.SUCCESS);
            setTimeout(() => {
                onSuccess(selectedPlan.tier);
                onClose();
                resetModal();
            }, 2000);
        } catch (err: unknown) {
            setStatus(PaymentStatus.FAILED);
            setError(err instanceof Error ? err.message : 'Transaction failed. Please try again.');
        }
    };

    const resetModal = () => {
        setStep('plans');
        setStatus(PaymentStatus.IDLE);
        setError(null);
        setPhoneNumber('');
    };

    const handleClose = () => {
        onClose();
        setTimeout(resetModal, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
                >
                    <motion.div
                        initial={{ y: '100%', scale: 1 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="w-full sm:max-w-md bg-slate-900 sm:rounded-3xl rounded-t-3xl relative overflow-hidden max-h-[95vh] flex flex-col"
                    >
                        {/* Glow */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 blur-3xl rounded-full pointer-events-none"
                            style={{ background: `${selectedPlan.color}20` }}
                        />

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-6 pb-4 flex-shrink-0">
                            <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="flex items-center gap-2 text-white font-bold">
                                <span style={{ color: selectedPlan.color }}>{TIER_ICONS[selectedPlan.tier]}</span>
                                <span>Upgrade to {selectedPlan.name}</span>
                            </div>
                            <div className="w-9" />
                        </div>

                        <div className="overflow-y-auto scrollbar-hide flex-1">
                            <AnimatePresence mode="wait">

                                {/* STEP 1: Plan Selection */}
                                {step === 'plans' && (
                                    <motion.div key="plans" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                                        {/* Billing Toggle */}
                                        <div className="flex items-center justify-center gap-3 mb-5 px-5">
                                            <div className="flex bg-slate-800 rounded-full p-1 gap-1">
                                                {(['monthly', 'annual'] as const).map(cycle => (
                                                    <button
                                                        key={cycle}
                                                        onClick={() => setBillingCycle(cycle)}
                                                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all capitalize ${billingCycle === cycle ? 'bg-white text-slate-900' : 'text-slate-400'
                                                            }`}
                                                    >
                                                        {cycle === 'annual' ? 'Annual (Save 35%)' : 'Monthly'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Plans */}
                                        <div className="px-4 space-y-3 pb-4">
                                            {SUBSCRIPTION_PLANS.map(plan => {
                                                const isSelected = selectedPlan.tier === plan.tier;
                                                const isCurrent = currentTier === plan.tier;
                                                const displayPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualMonthlyPrice;
                                                return (
                                                    <motion.button
                                                        key={plan.tier}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setSelectedPlan(plan)}
                                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${isSelected ? 'border-opacity-100' : 'border-white/10 bg-slate-800/50'
                                                            }`}
                                                        style={{
                                                            borderColor: isSelected ? plan.color : undefined,
                                                            background: isSelected ? `${plan.color}10` : undefined,
                                                        }}
                                                    >
                                                        {plan.popular && !isCurrent && (
                                                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-black"
                                                                style={{ background: plan.color }}
                                                            >
                                                                MOST POPULAR
                                                            </div>
                                                        )}
                                                        {isCurrent && (
                                                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">
                                                                CURRENT
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                                                style={{ background: `${plan.color}20`, color: plan.color }}
                                                            >
                                                                {TIER_ICONS[plan.tier]}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white text-base">{plan.name}</h3>
                                                                <p className="text-sm font-bold" style={{ color: plan.color }}>
                                                                    {displayPrice.toLocaleString()} XAF/mo
                                                                    {billingCycle === 'annual' && (
                                                                        <span className="text-xs text-slate-400 font-normal ml-1">billed annually</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <ul className="space-y-1.5">
                                                            {plan.features.map((f, i) => (
                                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* CTA */}
                                        <div className="px-5 pb-8 pt-2 flex-shrink-0">
                                            <motion.button
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => setStep('checkout')}
                                                className="w-full py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-2 shadow-xl"
                                                style={{ background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}cc)` }}
                                            >
                                                Continue
                                                <ChevronRight className="w-5 h-5" />
                                            </motion.button>
                                            <p className="text-center text-slate-500 text-xs mt-3">
                                                Cancel anytime · No hidden fees
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 2: Checkout */}
                                {step === 'checkout' && (
                                    <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

                                        {status === PaymentStatus.SUCCESS ? (
                                            <div className="flex flex-col items-center py-16 px-5">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                >
                                                    <CheckCircle className="w-20 h-20 text-green-400 mb-6" />
                                                </motion.div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Welcome to {selectedPlan.name}!</h3>
                                                <p className="text-slate-400 text-center">Your premium features are now unlocked. Enjoy!</p>
                                            </div>
                                        ) : (
                                            <div className="px-5 pb-8 space-y-5">
                                                {/* Back */}
                                                <button
                                                    onClick={() => setStep('plans')}
                                                    className="flex items-center gap-1 text-slate-400 text-sm hover:text-white transition-colors mb-1"
                                                >
                                                    ← Back to plans
                                                </button>

                                                {/* Summary */}
                                                <div className="p-4 rounded-2xl border border-white/10 bg-slate-800/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                                                style={{ background: `${selectedPlan.color}20`, color: selectedPlan.color }}>
                                                                {TIER_ICONS[selectedPlan.tier]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white">{selectedPlan.name}</p>
                                                                <p className="text-xs text-slate-400 capitalize">{billingCycle} billing</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-white text-lg"
                                                                style={{ color: selectedPlan.color }}>
                                                                {price.toLocaleString()} XAF
                                                            </p>
                                                            <p className="text-xs text-slate-500">/month</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* MoMo Info */}
                                                <div className="bg-slate-800/60 border border-white/10 p-4 rounded-xl flex items-start gap-3">
                                                    <div className="p-2 bg-yellow-500/20 rounded-full flex-shrink-0">
                                                        <Shield className="w-4 h-4 text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-yellow-300">Secure Mobile Money Payment</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            You'll receive a prompt to approve <span className="text-white font-bold">{(billingCycle === 'annual' ? price * 12 : price).toLocaleString()} XAF</span> via MTN MoMo or Orange Money.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Phone Input */}
                                                <div>
                                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                                        Mobile Money Number
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                            <span className="text-slate-400 text-sm font-bold">+237</span>
                                                            <div className="w-px h-5 bg-slate-700" />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={phoneNumber}
                                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                                            placeholder="6XXXXXXXX"
                                                            disabled={status === PaymentStatus.PROCESSING}
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-20 pr-4 text-white focus:outline-none focus:border-white/40 transition-colors font-mono tracking-wider"
                                                        />
                                                        <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    </div>
                                                    {phoneNumber.length > 0 && !isValidPhone && (
                                                        <p className="text-red-400 text-xs mt-1.5">Enter a valid 9-digit Cameroon number starting with 6 or 7</p>
                                                    )}
                                                    {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                                                </div>

                                                {/* Pay Button */}
                                                <motion.button
                                                    whileTap={{ scale: status === PaymentStatus.PROCESSING ? 1 : 0.97 }}
                                                    onClick={handlePayment}
                                                    disabled={status === PaymentStatus.PROCESSING || !isValidPhone}
                                                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${status === PaymentStatus.PROCESSING || !isValidPhone
                                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                        : 'text-white shadow-xl'
                                                        }`}
                                                    style={status !== PaymentStatus.PROCESSING && isValidPhone ? {
                                                        background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}bb)`
                                                    } : undefined}
                                                >
                                                    {status === PaymentStatus.PROCESSING ? (
                                                        <><Loader2 className="w-5 h-5 animate-spin" /> Awaiting PIN Approval...</>
                                                    ) : status === PaymentStatus.FAILED ? (
                                                        'Retry Payment'
                                                    ) : (
                                                        <>Pay {(billingCycle === 'annual' ? price * 12 : price).toLocaleString()} XAF</>
                                                    )}
                                                </motion.button>

                                                <p className="text-center text-slate-600 text-xs">
                                                    By subscribing you agree to our Terms of Service
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionModal;

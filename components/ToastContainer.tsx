import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, Heart } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const ICONS = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    match: <Heart className="w-5 h-5 text-rose-500 fill-current" />,
};

const BG = {
    success: 'bg-slate-900 border-green-500/30',
    error: 'bg-slate-900 border-red-500/30',
    info: 'bg-slate-900 border-blue-500/30',
    match: 'bg-slate-900 border-rose-500/40',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl text-white text-sm font-medium ${BG[toast.type]}`}
                        onClick={() => onRemove(toast.id)}
                    >
                        {ICONS[toast.type]}
                        <span>{toast.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;

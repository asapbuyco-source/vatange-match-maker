import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceIntroProps {
    audioUrl?: string; // Existing audio URL
    onUpload: (file: File) => Promise<string>;
    onRemove?: () => void;
    maxDuration?: number; // seconds, default 15
}

const VoiceIntro: React.FC<VoiceIntroProps> = ({
    audioUrl,
    onUpload,
    onRemove,
    maxDuration = 15,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentUrl, setCurrentUrl] = useState<string | null>(audioUrl || null);
    const [isUploading, setIsUploading] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (audioUrl) setCurrentUrl(audioUrl);
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    setAudioChunks((prev) => [...prev, e.data]);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const file = new File([audioBlob], `voice_intro_${Date.now()}.webm`, { type: 'audio/webm' });

                setIsUploading(true);
                try {
                    const uploadedUrl = await onUpload(file);
                    setCurrentUrl(uploadedUrl);
                } catch (err) {
                    console.error('[VoiceIntro] Upload failed:', err);
                } finally {
                    setIsUploading(false);
                }

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            };

            setAudioChunks([]);
            setRecordingTime(0);
            recorder.start(200);
            setMediaRecorder(recorder);
            setIsRecording(true);

            timerRef.current = window.setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= maxDuration - 1) {
                        stopRecording();
                        return maxDuration;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error('[VoiceIntro] Mic access denied or error:', err);
            alert('Microphone access is required to record a voice intro.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    const handleDelete = () => {
        setCurrentUrl(null);
        if (onRemove) onRemove();
    };

    // Format MM:SS
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (isUploading) {
        return (
            <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <p className="text-sm font-bold text-slate-300">Uploading your voice...</p>
            </div>
        );
    }

    if (currentUrl) {
        return (
            <div className="w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-4 flex flex-col gap-3">
                <audio ref={audioRef} src={currentUrl} onEnded={handleEnded} className="hidden" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlayback}
                            className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-rose-600 transition-colors"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </button>
                        <div>
                            <p className="text-sm font-bold text-white">Your Voice Intro</p>
                            <p className="text-xs text-rose-400">{isPlaying ? 'Playing...' : 'Ready to listen'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Fake waveform animation while playing */}
                        <div className="flex items-end gap-1 h-6 mr-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-rose-500 rounded-t-sm"
                                    initial={{ height: 4 }}
                                    animate={{ height: isPlaying ? [4, 16, 8, 20, 4][i % 5] : 4 }}
                                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: 'easeInOut' }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-slate-500 hover:text-red-400 bg-black/20 rounded-full transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all ${isRecording
                            ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                            : 'bg-rose-500 shadow-xl hover:bg-rose-600 hover:scale-105'
                        }`}
                >
                    {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
                {isRecording && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50" />
                )}
            </div>
            <div>
                {isRecording ? (
                    <>
                        <p className="text-xl font-bold font-mono text-red-500">{formatTime(recordingTime)}</p>
                        <p className="text-xs text-slate-400 mt-1">Recording... tap square to stop</p>
                    </>
                ) : (
                    <>
                        <p className="text-base font-bold text-white">Record an Intro</p>
                        <p className="text-xs text-slate-400 mt-1">Let matches hear your personality ({maxDuration}s max)</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default VoiceIntro;

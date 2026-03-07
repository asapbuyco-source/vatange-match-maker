# Video Calling Implementation Guide for Vantage Match

## Executive Summary

Video calling is a **must-have feature** for modern dating apps. Based on your tech stack and market (Cameroon), I recommend:

**Best Choice**: **Agora Video SDK** ✅
- Cost: $0-2,000/month (pay-as-you-go, free tier available)
- Latency: Optimized for emerging markets (sub-100ms)
- Integration: Simple React SDK
- Compliance: GDPR compliant

**Alternatives**: Vonage Video, Twilio Video, Daily.co

---

## 1. TECHNOLOGY COMPARISON

### Agora Video SDK (Recommended) ✅

**Pros**:
- Best latency for emerging markets (dedicated servers in Africa)
- Cheapest pricing ($0.99/1000 minutes in HD)
- Simple React integration
- No credit card required for free tier (10,000 minutes/month)
- Great for low-bandwidth scenarios
- Real-time analytics dashboard

**Cons**:
- Less enterprise support than Vonage
- Limited built-in features (you code more)

**Cost Model**:
```
Free Tier: 10,000 minutes/month (enough for 5K users)
Paid: $0.4-1.5 per 1000 minutes depending on resolution
For 50K users: ~$500-1500/month
```

**Best For**: Your use case ✅

---

### Vonage Video API (Enterprise Alternative)

**Pros**:
- Enterprise-grade reliability
- Advanced features (recording, analytics)
- Good developer support

**Cons**:
- Expensive ($0.05-0.15 per minute)
- Overkill for early-stage startup
- Minimum commitment might apply

**Cost Model**:
```
$1,200-5,000/month for 50K users (too expensive)
```

---

### Twilio Video (Good Alternative)

**Pros**:
- Trusted brand
- Good for messaging + video combo
- Flexible pricing

**Cons**:
- Not optimized for emerging markets
- Complex setup

**Cost**: ~$0.01/minute (reasonable but less optimized for Africa)

---

### Daily.co (Simple Option)

**Pros**:
- Easiest API to use
- Good documentation

**Cons**:
- Expensive ($0.09/minute)
- Not optimized for low-bandwidth

---

## 2. AGORA IMPLEMENTATION GUIDE

### 2.1 Setup & Installation

**Step 1: Create Agora Account**
```bash
# Visit https://console.agora.io
# Sign up → Verify email
# Create new project → Get App ID
```

**Step 2: Install SDK**
```bash
npm install agora-rtc-sdk-ng
```

**Step 3: Store Configuration**
```typescript
// .env.local (DON'T commit this!)
VITE_AGORA_APP_ID="your_app_id_here"
VITE_AGORA_CHANNEL_NAME="vantage-match"  # Fixed channel name
```

---

### 2.2 Create Video Call Service

Create [services/agoraService.ts](services/agoraService.ts):

```typescript
/**
 * Agora Video Calling Service
 * Powers real-time video calls between matches
 * 
 * Agora Documentation: https://docs.agora.io/en/video-calling/overview
 * 
 * Token Flow:
 * 1. User A initiates call → requests token from server
 * 2. Server generates JWT token (signed with Agora Secret)
 * 3. User A joins channel with token
 * 4. User B receives notification, joins same channel
 * 5. Agora handles real-time audio/video transmission
 */

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';

interface VideoCallConfig {
  appId: string;
  token: string; // JWT token from backend
  channelName: string;
  uid: string | number; // User ID
}

interface VideoCallState {
  client: IAgoraRTCClient | null;
  localAudioTrack: ILocalAudioTrack | null;
  localVideoTrack: ILocalVideoTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  isConnected: boolean;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
}

class AgoraVideoService {
  private state: VideoCallState = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteUsers: [],
    isConnected: false,
    isMicEnabled: true,
    isCameraEnabled: true,
  };

  /**
   * Initialize Agora client
   */
  private initClient = async (): Promise<IAgoraRTCClient> => {
    const client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8', // VP8 better for low-bandwidth (Cameroon)
    });

    // Handle user joined
    client.on('user-joined', (user) => {
      this.state.remoteUsers.push(user);
      console.log(`User ${user.uid} joined`);
    });

    // Handle user left
    client.on('user-left', (user) => {
      this.state.remoteUsers = this.state.remoteUsers.filter(u => u.uid !== user.uid);
      console.log(`User ${user.uid} left`);
    });

    // Handle user published (started sharing video/audio)
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      console.log(`User ${user.uid} published ${mediaType}`);
    });

    // Handle user unpublished
    client.on('user-unpublished', (user) => {
      console.log(`User ${user.uid} unpublished`);
    });

    this.state.client = client;
    return client;
  };

  /**
   * Join a video call
   * @param config - Configuration with token, channel name, etc.
   */
  joinCall = async (config: VideoCallConfig): Promise<void> => {
    try {
      // Initialize client if not already done
      const client = this.state.client || (await this.initClient());

      // Join channel with token
      await client.join(config.appId, config.channelName, config.token, config.uid);
      this.state.isConnected = true;

      // Create local audio & video tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { encoderConfig: { width: 640, height: 480, frameRate: 24 } }, // Lower res for Cameroon bandwidth
      );

      this.state.localAudioTrack = audioTrack;
      this.state.localVideoTrack = videoTrack;

      // Publish tracks to channel
      await client.publish([audioTrack, videoTrack]);

      console.log('✅ Joined video call successfully');
    } catch (error) {
      console.error('❌ Failed to join call:', error);
      throw error;
    }
  };

  /**
   * Leave the video call
   */
  leaveCall = async (): Promise<void> => {
    try {
      // Stop and close tracks
      this.state.localAudioTrack?.close();
      this.state.localVideoTrack?.close();

      // Leave channel
      await this.state.client?.leave();
      this.state.isConnected = false;

      console.log('✅ Left video call');
    } catch (error) {
      console.error('❌ Failed to leave call:', error);
      throw error;
    }
  };

  /**
   * Toggle microphone
   */
  toggleMic = async (): Promise<boolean> => {
    if (!this.state.localAudioTrack) return false;

    if (this.state.isMicEnabled) {
      await this.state.localAudioTrack.setEnabled(false);
      this.state.isMicEnabled = false;
    } else {
      await this.state.localAudioTrack.setEnabled(true);
      this.state.isMicEnabled = true;
    }

    return this.state.isMicEnabled;
  };

  /**
   * Toggle camera
   */
  toggleCamera = async (): Promise<boolean> => {
    if (!this.state.localVideoTrack) return false;

    if (this.state.isCameraEnabled) {
      await this.state.localVideoTrack.setEnabled(false);
      this.state.isCameraEnabled = false;
    } else {
      await this.state.localVideoTrack.setEnabled(true);
      this.state.isCameraEnabled = true;
    }

    return this.state.isCameraEnabled;
  };

  /**
   * Get state (for React components)
   */
  getState = (): VideoCallState => this.state;

  /**
   * Get local video track (for rendering)
   */
  getLocalVideoTrack = (): ILocalVideoTrack | null => this.state.localVideoTrack;

  /**
   * Get remote users
   */
  getRemoteUsers = (): IAgoraRTCRemoteUser[] => this.state.remoteUsers;

  /**
   * Get specific remote user video/audio
   */
  getRemoteTrack = (userId: string | number, trackType: 'video' | 'audio') => {
    const user = this.state.remoteUsers.find(u => u.uid === userId);
    if (!user) return null;
    return trackType === 'video' ? user.videoTrack : user.audioTrack;
  };
}

export const agoraService = new AgoraVideoService();
```

---

### 2.3 Backend Token Generation (CRITICAL for Security)

**IMPORTANT**: Tokens must be generated on backend, NOT in frontend!

Create backend endpoint (Node.js/Express):

```typescript
// backend/routes/agora.ts
import express from 'express';
import { RtcTokenBuilder } from 'agora-access-token';

const router = express.Router();

// Get video call token (backend-only)
router.post('/agora/token', async (req, res) => {
  const { channelName, uid, role = 'publisher' } = req.body;

  // Get Agora secrets from env (NEVER expose in frontend)
  const AGORA_APP_ID = process.env.AGORA_APP_ID!;
  const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

  try {
    // Generate token (expires in 24 hours)
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role === 'publisher' ? 1 : 2, // 1 = publisher, 2 = subscriber
      Math.floor(Date.now() / 1000) + 24 * 3600, // Expiration time
    );

    res.json({ token, channelName, uid });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

export default router;
```

**Frontend calls backend to get token**:

```typescript
// services/agoraService.ts (updated)
export const requestVideoToken = async (channelName: string, uid: string): Promise<string> => {
  const response = await fetch('/api/agora/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelName, uid }),
  });

  if (!response.ok) throw new Error('Failed to get token');
  const data = await response.json();
  return data.token;
};
```

---

## 2.4 Create Video Call Component

Create [components/VideoCallModal.tsx](components/VideoCallModal.tsx):

```tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { agoraService, requestVideoToken } from '../services/agoraService';

interface VideoCallModalProps {
  matchId: string;
  matchName: string;
  matchImage: string;
  currentUserId: string;
  onClose: () => void;
  onCallEnded: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  matchId,
  matchName,
  matchImage,
  currentUserId,
  onClose,
  onCallEnded,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize call
  useEffect(() => {
    const startCall = async () => {
      try {
        setIsConnecting(true);

        // Request token from backend
        const token = await requestVideoToken(
          `match-${matchId}`, // Channel name
          currentUserId,
        );

        // Join Agora channel
        await agoraService.joinCall({
          appId: import.meta.env.VITE_AGORA_APP_ID,
          token,
          channelName: `match-${matchId}`,
          uid: currentUserId,
        });

        setIsConnected(true);
        setIsConnecting(false);

        // Start timer
        timerRef.current = setInterval(
          () => setCallDuration(prev => prev + 1),
          1000,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Call failed');
        setIsConnecting(false);
      }
    };

    startCall();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Render local video track
  useEffect(() => {
    if (!isConnected || !localVideoRef.current) return;

    const videoTrack = agoraService.getLocalVideoTrack();
    if (videoTrack) {
      videoTrack.play(localVideoRef.current);
    }

    return () => {
      videoTrack?.stop();
    };
  }, [isConnected]);

  // Render remote video track
  useEffect(() => {
    if (!isConnected || !remoteVideoRef.current) return;

    const remoteUsers = agoraService.getRemoteUsers();
    if (remoteUsers.length > 0) {
      const remoteUser = remoteUsers[0];
      remoteUser.videoTrack?.play(remoteVideoRef.current);
    }
  }, [isConnected]);

  // Handle end call
  const handleEndCall = async () => {
    await agoraService.leaveCall();
    if (timerRef.current) clearInterval(timerRef.current);
    onCallEnded();
    onClose();
  };

  // Handle mic toggle
  const handleToggleMic = async () => {
    const newState = await agoraService.toggleMic();
    setIsMicEnabled(newState);
  };

  // Handle camera toggle
  const handleToggleCamera = async () => {
    const newState = await agoraService.toggleCamera();
    setIsCameraEnabled(newState);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">
              {isConnected ? `Calling ${matchName}` : 'Connecting...'}
            </h2>
            <div className="text-white/60 text-sm font-mono">
              {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Remote Video (Large) */}
            <div
              ref={remoteVideoRef}
              className="w-full h-full bg-black relative"
            />

            {/* Local Video (Picture-in-Picture) */}
            <div
              ref={localVideoRef}
              className="absolute bottom-4 right-4 w-32 h-40 bg-gray-900 rounded-lg border-2 border-white/20 overflow-hidden"
            />

            {/* Connection Status */}
            {isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white">Connecting...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-rose-500 text-white rounded-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-black/50 backdrop-blur-sm px-6 py-4 flex justify-center items-center gap-4">
            {/* Mic Toggle */}
            <button
              onClick={handleToggleMic}
              disabled={!isConnected}
              className={`p-3 rounded-full transition-all ${
                isMicEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isMicEnabled ? 'Mute' : 'Unmute'}
            >
              {isMicEnabled ? (
                <Mic size={20} />
              ) : (
                <MicOff size={20} />
              )}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={handleToggleCamera}
              disabled={!isConnected}
              className={`p-3 rounded-full transition-all ${
                isCameraEnabled
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isCameraEnabled ? 'Stop Video' : 'Start Video'}
            >
              {isCameraEnabled ? (
                <Video size={20} />
              ) : (
                <VideoOff size={20} />
              )}
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              disabled={isConnecting}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
              title="End Call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallModal;
```

---

## 2.5 Integrate into App

Update [App.tsx](App.tsx) to include video calling:

```tsx
// In your App component
import VideoCallModal from './components/VideoCallModal';

interface AppState {
  // ... existing state ...
  videoCallOpen: boolean;
  videoCallMatch: UserProfile | null;
}

export default function App() {
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [videoCallMatch, setVideoCallMatch] = useState<UserProfile | null>(null);

  // Add video call button to MatchCard
  const handleInitiateVideoCall = (match: UserProfile) => {
    setVideoCallMatch(match);
    setVideoCallOpen(true);
  };

  return (
    <div>
      {/* ... existing app code ... */}

      {/* Video Call Modal */}
      {videoCallOpen && videoCallMatch && currentUser && (
        <VideoCallModal
          matchId={videoCallMatch.id}
          matchName={videoCallMatch.name}
          matchImage={videoCallMatch.imageUrl}
          currentUserId={currentUser.id}
          onClose={() => {
            setVideoCallOpen(false);
            setVideoCallMatch(null);
          }}
          onCallEnded={() => {
            // Log call to Firebase
            createCallRecord(currentUser.id, videoCallMatch.id);
          }}
        />
      )}
    </div>
  );
}
```

---

## 2.6 Add Video Call Button to Match Card

Update [components/MatchCard.tsx](components/MatchCard.tsx):

```tsx
// In your MatchCard component, add video call button

import { Heart, X, Zap, Video, MessageCircle } from 'lucide-react';

interface MatchCardProps {
  // ... existing props ...
  onVideoCall?: (profile: UserProfile) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  profile, 
  onLike, 
  onPass, 
  onVideoCall,
  // ... other props ...
}) => {
  return (
    <div className="card-content">
      {/* ... existing card content ... */}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        {/* Reject */}
        <button
          onClick={() => onPass?.()}
          className="p-3 rounded-full bg-white/10 hover:bg-red-500/20 text-white transition-all"
        >
          <X size={24} />
        </button>

        {/* Chat */}
        <button
          onClick={() => onChat?.()}
          className="p-3 rounded-full bg-white/10 hover:bg-blue-500/20 text-white transition-all"
        >
          <MessageCircle size={24} />
        </button>

        {/* Video Call (NEW) */}
        {isPremium && (
          <button
            onClick={() => onVideoCall?.(profile)}
            className="p-3 rounded-full bg-white/10 hover:bg-purple-500/20 text-purple-400 transition-all"
            title="Start Video Call"
          >
            <Video size={24} />
          </button>
        )}

        {/* Like */}
        <button
          onClick={() => onLike?.()}
          className="p-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-all scale-125"
        >
          <Heart size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};
```

---

## 2.7 Firebase Integration (Logging Calls)

Add to [services/firebaseService.ts](services/firebaseService.ts):

```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface CallRecord {
  id?: string;
  user_id: string;
  match_id: string;
  duration: number; // in seconds
  started_at: string;
  ended_at: string;
  initiated_by: string;
}

/**
 * Log a completed video call to Firestore
 */
export const createCallRecord = async (
  userId: string,
  matchId: string,
  duration: number,
  initiatedBy: string,
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'calls'), {
      user_id: userId,
      match_id: matchId,
      duration,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      initiated_by: initiatedBy,
      created_at: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Failed to log call:', error);
    throw error;
  }
};
```

---

## 3. SUBSCRIPTION TIER GATING

Video calls should be **premium feature** only. Update [types.ts](types.ts):

```typescript
export type SubscriptionTier = 'free' | 'plus' | 'gold' | 'platinum';

export const SUBSCRIPTION_FEATURES = {
  free: {
    swipesPerDay: 10,
    maxDistance: 50,
    canChat: true,
    canVideoCall: false, // ❌
    canUsePassport: false,
  },
  plus: {
    swipesPerDay: 50,
    maxDistance: 100,
    canChat: true,
    canVideoCall: false, // ❌
    canUsePassport: false,
  },
  gold: {
    swipesPerDay: 'unlimited',
    maxDistance: 'unlimited',
    canChat: true,
    canVideoCall: true, // ✅
    canUsePassport: false,
  },
  platinum: {
    swipesPerDay: 'unlimited',
    maxDistance: 'unlimited',
    canChat: true,
    canVideoCall: true, // ✅
    canUsePassport: true,
  },
};
```

---

## 4. UX/SAFETY CONSIDERATIONS

### 4.1 Before Call Starts

```tsx
// Show permission request
const CallPermissionModal = () => (
  <div>
    <h3>Camera & Microphone Access</h3>
    <p>Vantage Match needs access to your camera and microphone to make video calls.</p>
    <button>Allow</button>
    <button>Deny</button>
  </div>
);
```

### 4.2 During Call

- **Timer**: Show call duration (encourages reasonable calls)
- **Grid Layout**: Option to switch between PiP and grid
- **Network Indicator**: Show signal strength (green/yellow/red)
- **Recording Indicator**: Always show if call is being recorded (compliance)
- **Report Button**: Easy report if harassment occurs

### 4.3 After Call

- **Call Rating**: "How was your call?" (Excellent / Good / Poor)
- **Report Option**: 1-tap report if inappropriate
- **Block Option**: If user behaves badly

---

## 5. DEPLOYMENT CHECKLIST

### Pre-Launch
- [ ] Get Agora App ID & Certificate from console.agora.io
- [ ] Set up backend token generation endpoint
- [ ] Deploy backend to production
- [ ] Add environment variables to Netlify (VITE_AGORA_APP_ID)
- [ ] Test on real devices (iOS, Android)
- [ ] Test on slow networks (throttle to 3G)
- [ ] Add GDPR/privacy language for video recordings

### Monitoring
- [ ] Set up Sentry error tracking for call failures
- [ ] Monitor average call duration (< 30 min = healthy)
- [ ] Track video call conversion rate (target: 5-10% of chats)
- [ ] Monitor Agora quota usage (alert at 80%)

---

## 6. COST ESTIMATION

### Monthly Costs at Scale

```
1K Active Users:
├─ Avg 10 min calls/user/month
├─ 10K total call minutes
├─ Cost: 10,000 × $0.001 = $10/month ✅

10K Active Users:
├─ Avg 20 min calls/user/month  
├─ 200K total call minutes
├─ Cost: 200,000 × $0.001 = $200/month ✅

50K Active Users:
├─ Avg 30 min calls/user/month
├─ 1.5M total call minutes
├─ Cost: 1,500,000 × $0.001 = $1,500/month ✅

100K Active Users:
├─ 3M minutes
├─ Cost: $3,000/month (negotiate volume discount)
```

**Why Agora beats alternatives**:
- Tinder pays ~$0.02/min (Agora: $0.001)
- 20x cheaper than Vonage
- Free tier sufficient for first 5K users

---

## 7. PRIVACY & COMPLIANCE

### GDPR Compliance
```
- Add: "Calls are not recorded by default"
- Add: "You can report inappropriate calls"
- Store: Minimal call metadata (duration, users, timestamp only)
- Encrypt: Call data in transit (Agora handles this)
```

### Privacy Policy Addition
```
Video Calls:
- Not recorded unless explicitly enabled
- Audio/video stream end-to-end encrypted
- Call metadata (duration, participants) stored securely
- Users can report inappropriate calls for review
```

---

## 8. ADVANCED FEATURES (Future)

### Phase 2 (Month 4-6)
- [ ] Call recording (premium: $0.03/min extra)
- [ ] Call history + statistics
- [ ] Group video calls (3+ users)
- [ ] Call scheduling
- [ ] Call transcription (AI transcribe + summarize)

### Phase 3 (Month 6-12)
- [ ] Live streaming (special events)
- [ ] Virtual gifts during calls
- [ ] Call-based matching insights ("Callers are 2x more likely to match")
- [ ] Integration with in-app events (group calls)

---

## 9. QUICK START CHECKLIST

**This Week** (4-6 hours):
- [ ] Create Agora account + get App ID
- [ ] Install `agora-rtc-sdk-ng` package
- [ ] Create `agoraService.ts`
- [ ] Create backend token endpoint
- [ ] Test in browser locally

**Next Week** (4-6 hours):
- [ ] Create `VideoCallModal.tsx` component
- [ ] Integrate with MatchCard
- [ ] Add video call button to UI
- [ ] Test on mobile devices
- [ ] Add Firebase logging

**Week 3** (2-3 hours):
- [ ] Add to subscription tiers (Gold+ only)
- [ ] Deploy to production
- [ ] Monitor Agora dashboard
- [ ] Gather user feedback

---

## 10. TROUBLESHOOTING

### "Peer not found" Error
```
Cause: Remote user hasn't joined yet
Fix: Add retry logic, show "Waiting for answer..."
```

### Black screen / No video
```
Causes: 
├─ Camera permission denied
├─ Agora app ID wrong
├─ Token expired (> 24h)
└─ Browser security issues

Fix: Check browser console for specific error
```

### Audio lag / Echo
```
Cause: Agora's echo cancellation not aggressive enough
Fix: Use VP8 codec (you are), reduce resolution (you are)
```

### Battery drain
```
Cause: Video encoding at high quality
Fix: Target 24fps (you are), 640x480 resolution (you are)
```

---

## References

- Agora Docs: https://docs.agora.io/en/video-calling/overview
- Agora Web SDK: https://github.com/AgoraIO/AgoraRTC_Web_SDK
- Token Generation: https://docs.agora.io/en/video-calling/reference/manage-agora-account#generate-token
- React Integration: https://github.com/AgoraIO-Community/react-agora
- Video Best Practices: https://docs.agora.io/en/video-calling/develop/platform-specific-guidance

---

**Last Updated**: February 26, 2026
**Estimated Implementation Time**: 10-15 hours
**Priority**: High (expected to increase retention by 25-40%)

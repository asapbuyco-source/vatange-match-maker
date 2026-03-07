export type Theme = 'royal' | 'rose';

export type RelationshipGoal = 'dating' | 'serious' | 'marriage' | 'christian';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  /** Kept as `job` for backward compat, represents job title */
  job: string;
  bio: string;
  imageUrl: string;
  interests: string[];

  // Extended profile fields
  location?: string;
  gender?: 'male' | 'female' | 'other';
  verified?: boolean;
  verified_status?: boolean;
  isPremium?: boolean;
  distance?: number; // km
  lastActive?: string;

  // New Amoura fields
  university?: string;
  profession?: string;
  relationship_goal?: RelationshipGoal;
  profile_photos?: string[]; // up to 6 photo URLs
  voice_intro?: string;       // audio URL (10–15s recording)
}

export interface AICompatibilityResult {
  score: number;
  insight: string;
  icebreaker: string;
}

export enum PaymentStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'match';
  text: string;
  timestamp: Date;
  isRead?: boolean;
  type?: 'text' | 'voice' | 'emoji';
  audioUrl?: string; // for voice messages
}

export interface FilterPreferences {
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  genderPreference: 'male' | 'female' | 'everyone';
  city: string;
  relationship_goal?: RelationshipGoal | 'all';
}

export type SubscriptionTier = 'free' | 'plus' | 'gold' | 'platinum';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number;  // in XAF
  annualMonthlyPrice: number;
  features: string[];
  color: string;
  popular?: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'match';
  duration?: number;
}

export interface SuperLikeState {
  remaining: number;
  resetAt: Date;
}

export interface ReferralState {
  referralCode: string;
  invitesSent: number;
  invitesAccepted: number;
  premiumDaysEarned: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'plus',
    name: 'Amoura+',
    monthlyPrice: 2990,
    annualMonthlyPrice: 1990,
    color: '#FF4B6E',
    features: [
      'Unlimited Likes',
      'Rewind Last Swipe',
      'Passport — Swipe Anywhere in Cameroon',
      'Hide Ads',
      '1 Free Boost per Month',
    ],
  },
  {
    tier: 'gold',
    name: 'Amoura Gold',
    monthlyPrice: 4990,
    annualMonthlyPrice: 3490,
    color: '#FFD166',
    popular: true,
    features: [
      'Everything in Amoura+',
      'See Who Likes You',
      'AI Compatibility Insights',
      'Magic Icebreakers (Unlimited)',
      '5 SuperLikes per Day',
      'Voice Intro on Profile',
    ],
  },
  {
    tier: 'platinum',
    name: 'Amoura Platinum',
    monthlyPrice: 7990,
    annualMonthlyPrice: 5990,
    color: '#6C63FF',
    features: [
      'Everything in Amoura Gold',
      'Priority Likes (Your profile shown first)',
      'Message Before Matching',
      'AI Conversation Coach',
      'Profile Boost x2 per Week',
      'Exclusive Platinum Badge',
    ],
  },
];

export const RELATIONSHIP_GOALS: { value: RelationshipGoal; label: string; emoji: string }[] = [
  { value: 'dating', label: 'Dating', emoji: '💑' },
  { value: 'serious', label: 'Serious Relationship', emoji: '💍' },
  { value: 'marriage', label: 'Marriage Minded', emoji: '⛪' },
  { value: 'christian', label: 'Christian Dating', emoji: '✝️' },
];

export const INTEREST_TAGS = [
  'Football', 'Church', 'Music', 'Business', 'Fitness', 'Travel',
  'Movies', 'Food', 'Tech', 'Art', 'Fashion', 'Reading',
  'Dancing', 'Photography', 'Nature', 'Spirituality', 'Gaming', 'Cooking',
];

export const DISTANCE_OPTIONS = [5, 10, 25, 50, 100]; // km

export const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbe', 'Buea', 'Kumba', 'Nkongsamba', 'Edéa'
];
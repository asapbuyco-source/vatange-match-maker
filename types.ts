export type Theme = 'royal' | 'rose';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  job: string;
  bio: string;
  imageUrl: string;
  interests: string[];
  location?: string;
  gender?: 'male' | 'female' | 'other';
  verified?: boolean;
  isPremium?: boolean;
  distance?: number; // km
  lastActive?: string;
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
}

export interface FilterPreferences {
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  genderPreference: 'male' | 'female' | 'everyone';
  city: string;
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

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'plus',
    name: 'Vantage+',
    monthlyPrice: 2990,
    annualMonthlyPrice: 1990,
    color: '#FD297B',
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
    name: 'Vantage Gold',
    monthlyPrice: 4990,
    annualMonthlyPrice: 3490,
    color: '#eab308',
    popular: true,
    features: [
      'Everything in Vantage+',
      'See Who Likes You',
      'AI Compatibility Insights',
      'Magic Icebreakers (Unlimited)',
      '5 SuperLikes per Day',
    ],
  },
  {
    tier: 'platinum',
    name: 'Vantage Platinum',
    monthlyPrice: 7990,
    annualMonthlyPrice: 5990,
    color: '#a78bfa',
    features: [
      'Everything in Vantage Gold',
      'Priority Likes (Your profile shown first)',
      'Message Before Matching',
      'AI Conversation Coach',
      'Profile Boost x2 per Week',
      'Exclusive Platinum Badge',
    ],
  },
];

export const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbe', 'Buea', 'Kumba', 'Nkongsamba', 'Edéa'
];
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  job: string;
  bio: string;
  imageUrl: string;
  interests: string[];
}

export interface AICompatibilityResult {
  score: number;
  insight: string;
  icebreaker: string;
}

export enum PaymentStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING', // Simulating USSD push
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'match';
  text: string;
  timestamp: Date;
}
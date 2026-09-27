export type ToneType = 'Funny' | 'Professional' | 'Aesthetic' | 'Inspirational' | 'Viral Hook';

export type PlatformType = 'instagram' | 'tiktok' | 'youtube';

export type TeamRole = 'OWNER' | 'REVIEWER';

export type ReviewDecision = 'APPROVED' | 'REWORK' | 'DISCARDED' | 'PENDING';

export type PostStatus = 'PENDING' | 'PUBLISHED' | 'REMINDER_SENT';

export interface User {
  id: string;
  email: string;
  mobileNumber: string;
  brandTone: ToneType;
  role?: TeamRole;
  teamId?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface DraftVersion {
  id: string;
  draftId: string;
  versionNo: number;
  content: string;
  tag: string;
  createdAt: string;
  note?: string;
}

export interface Draft {
  id: string;
  userId: string;
  content: string;
  tag: string;
  versionNo: number;
  createdAt: string;
  updatedAt: string;
  reviewStatus?: ReviewDecision;
}

export interface PastPost {
  id: string;
  userId: string;
  content: string;
  platform: PlatformType;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  postedAt: string;
  hashtags: string[];
}

export interface StyleProfile {
  id: string;
  userId: string;
  sampleCount: number;
  dominantTone: ToneType;
  toneVector: {
    funny: number;
    professional: number;
    aesthetic: number;
    hookIntensity: number;
    emojiFrequency: number;
  };
  topKeywords: string[];
  avgWordCount: number;
  voiceSummary: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  userEmail: string;
  role: TeamRole;
  joinedAt: string;
}

export interface DraftReview {
  id: string;
  draftId: string;
  draftTitleSnippet: string;
  reviewerId: string;
  reviewerEmail: string;
  decision: ReviewDecision;
  feedback?: string;
  decidedAt: string;
}

export interface PlatformConnection {
  id: string;
  userId: string;
  platform: PlatformType;
  isAuthorized: boolean;
  platformUsername: string;
  lastSyncedAt: string;
}

export interface ScheduledPost {
  id: string;
  draftId: string;
  userId: string;
  platform: PlatformType;
  scheduledTime: string;
  status: PostStatus;
  autoPublish: boolean;
  formattedContent: string;
  reminderSent: boolean;
  createdAt: string;
  publishedAt?: string;
}

export interface EngagementData {
  id: string;
  scheduledPostId: string;
  likes: number;
  comments: number;
  shares: number;
  watchTime: string; // e.g. "82% avg retention"
  collectedAt: string;
}

export interface CaptionVariant {
  id: string;
  text: string;
  hook: string;
  hashtags: string[];
  tone: ToneType;
  styleMatchScore: number; // 0 - 100
  styleRankReason?: string;
}

export interface AttentionAnalysisResult {
  dropOffPointSeconds: number;
  dropOffWordIndex: number;
  dropOffPhrase: string;
  dropOffReason: string;
  suggestedHook: string;
  suggestedCta: string;
  hookScore: number; // 0 - 100
  readabilityScore: number; // 0 - 100
  pacingScore: number; // 0 - 100
  wordRhythm: { word: string; attentionScore: number }[];
}

export interface OptimalTimeRecommendation {
  platform: PlatformType;
  dayOfWeek: string;
  timeSlot: string;
  isoDateString: string;
  confidenceScore: number;
  historicalEngagementFactor: string;
}

export interface OtpLog {
  id: string;
  email: string;
  mobile: string;
  otp: string;
  timestamp: string;
}

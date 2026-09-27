import {
  User,
  Draft,
  DraftVersion,
  StyleProfile,
  PastPost,
  Team,
  TeamMembership,
  DraftReview,
  PlatformConnection,
  ScheduledPost,
  EngagementData,
  OtpLog,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'creator_crew_users',
  CURRENT_USER_ID: 'creator_crew_current_user_id',
  DRAFTS: 'creator_crew_drafts',
  DRAFT_VERSIONS: 'creator_crew_draft_versions',
  STYLE_PROFILES: 'creator_crew_style_profiles',
  PAST_POSTS: 'creator_crew_past_posts',
  TEAMS: 'creator_crew_teams',
  TEAM_MEMBERSHIPS: 'creator_crew_team_memberships',
  DRAFT_REVIEWS: 'creator_crew_draft_reviews',
  PLATFORMS: 'creator_crew_platform_connections',
  SCHEDULED_POSTS: 'creator_crew_scheduled_posts',
  ENGAGEMENT_DATA: 'creator_crew_engagement_data',
  OTP_LOGS: 'creator_crew_otp_logs',
};

// Seed 12 sample past posts for the creator (FR-6)
const INITIAL_PAST_POSTS: PastPost[] = [
  {
    id: 'post-1',
    userId: 'user-owner-1',
    content: 'Stop scrolling: The secret to 10x creative output isn’t more hours, it’s ruthlessly protecting your 8 AM golden focus block. Here’s what my studio routine looks like.',
    platform: 'instagram',
    likes: 4230,
    comments: 312,
    shares: 890,
    engagementRate: 8.4,
    postedAt: '2026-09-01T08:15:00Z',
    hashtags: ['#CreatorStudio', '#DeepWork', '#MinimalistDesk', '#CreativeRoutine'],
  },
  {
    id: 'post-2',
    userId: 'user-owner-1',
    content: 'Unpopular opinion: Aesthetic setups don’t make you productive. Clear systems do. But having warm linen lighting definitely doesn’t hurt. 🕯️✨',
    platform: 'instagram',
    likes: 6150,
    comments: 489,
    shares: 1240,
    engagementRate: 9.8,
    postedAt: '2026-09-04T18:30:00Z',
    hashtags: ['#WorkspaceInspo', '#CreatorLife', '#MinimalAesthetic', '#StudioVibes'],
  },
  {
    id: 'post-3',
    userId: 'user-owner-1',
    content: 'POV: You finally stopped overthinking your content hooks and let your authentic tone speak. Engagement jumped 44% in 7 days.',
    platform: 'tiktok',
    likes: 12400,
    comments: 940,
    shares: 3100,
    engagementRate: 14.2,
    postedAt: '2026-09-07T12:00:00Z',
    hashtags: ['#CreatorTips', '#GrowthHack', '#AuthenticContent', '#ViralStrategy'],
  },
  {
    id: 'post-4',
    userId: 'user-owner-1',
    content: 'A gentle reminder for anyone editing until 2 AM: Consistency beats perfection every single time. Ship the draft.',
    platform: 'instagram',
    likes: 3890,
    comments: 204,
    shares: 670,
    engagementRate: 7.1,
    postedAt: '2026-09-10T20:10:00Z',
    hashtags: ['#MindfulCreation', '#SoloCreator', '#BurnoutPrevention'],
  },
  {
    id: 'post-5',
    userId: 'user-owner-1',
    content: '3 things I removed from my workflow this month: 1. Manual caption formatting. 2. Random posting times. 3. Endless draft tweaking. Total time saved: 14 hrs/week.',
    platform: 'tiktok',
    likes: 8940,
    comments: 630,
    shares: 1820,
    engagementRate: 11.5,
    postedAt: '2026-09-12T17:45:00Z',
    hashtags: ['#ProductivityTok', '#WorkflowAudit', '#CreatorEconomy'],
  },
  {
    id: 'post-6',
    userId: 'user-owner-1',
    content: 'How I design my YouTube thumbnails and title hooks before writing a single sentence of script. Full breakdown in this carousel.',
    platform: 'youtube',
    likes: 2100,
    comments: 185,
    shares: 430,
    engagementRate: 6.9,
    postedAt: '2026-09-15T15:00:00Z',
    hashtags: ['#YouTubeStrategy', '#ThumbnailDesign', '#VideoCreation'],
  },
  {
    id: 'post-7',
    userId: 'user-owner-1',
    content: 'Coffee poured, lo-fi on, draft vault open. Today we are batching 10 days of reels in 90 minutes using our custom style memory model. ☕🎧',
    platform: 'instagram',
    likes: 5420,
    comments: 390,
    shares: 1110,
    engagementRate: 8.9,
    postedAt: '2026-09-17T09:30:00Z',
    hashtags: ['#MorningRoutine', '#BatchCreating', '#StudioSession', '#CreativeFlow'],
  },
  {
    id: 'post-8',
    userId: 'user-owner-1',
    content: 'Why your hook is losing 60% of viewers in the first 3 seconds: You’re introducing yourself instead of answering their burning question. Fix it now.',
    platform: 'tiktok',
    likes: 15300,
    comments: 1200,
    shares: 4200,
    engagementRate: 16.1,
    postedAt: '2026-09-19T19:00:00Z',
    hashtags: ['#HookFormula', '#AudienceRetention', '#ContentOptimization'],
  },
  {
    id: 'post-9',
    userId: 'user-owner-1',
    content: 'Fall studio palette reset: Warm wood tones, matte black fixtures, and indirect linen lighting. What does your current creative space look like?',
    platform: 'instagram',
    likes: 7120,
    comments: 540,
    shares: 980,
    engagementRate: 9.3,
    postedAt: '2026-09-21T18:00:00Z',
    hashtags: ['#StudioAesthetic', '#DeskSetup', '#InteriorDesign', '#MoodyVibes'],
  },
  {
    id: 'post-10',
    userId: 'user-owner-1',
    content: 'The biggest shift in creator tools in 2026 is moving from generic AI chatbots to hyper-personalized style memory engines that sound authentically like YOU.',
    platform: 'youtube',
    likes: 3400,
    comments: 290,
    shares: 750,
    engagementRate: 7.8,
    postedAt: '2026-09-23T16:00:00Z',
    hashtags: ['#AITools', '#CreatorFuture', '#PersonalBranding'],
  },
  {
    id: 'post-11',
    userId: 'user-owner-1',
    content: 'Sunday evening content audit: Check your top 3 performing reels from the week, find the common denominator, and double down on that structure next week.',
    platform: 'instagram',
    likes: 4900,
    comments: 310,
    shares: 880,
    engagementRate: 8.1,
    postedAt: '2026-09-24T21:00:00Z',
    hashtags: ['#SundayReset', '#CreatorInsights', '#StrategicGrowth'],
  },
  {
    id: 'post-12',
    userId: 'user-owner-1',
    content: 'If you only have 30 minutes to make content today: 1 punchy hook, 2 actionable bullet points, 1 question CTA. Keep it effortless.',
    platform: 'tiktok',
    likes: 11200,
    comments: 780,
    shares: 2400,
    engagementRate: 13.5,
    postedAt: '2026-09-25T13:30:00Z',
    hashtags: ['#QuickTips', '#SimpleSystems', '#ContentCreator'],
  },
];

// Initial demo users
const INITIAL_USERS: User[] = [
  {
    id: 'user-owner-1',
    email: 'creator@crew.com',
    mobileNumber: '+1-555-0199',
    brandTone: 'Aesthetic',
    role: 'OWNER',
    teamId: 'team-1',
    isVerified: true,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'user-reviewer-1',
    email: 'reviewer@crew.com',
    mobileNumber: '+1-555-0288',
    brandTone: 'Professional',
    role: 'REVIEWER',
    teamId: 'team-1',
    isVerified: true,
    createdAt: '2026-08-05T14:00:00Z',
  },
];

const INITIAL_TEAM: Team = {
  id: 'team-1',
  ownerId: 'user-owner-1',
  name: 'Studio Crew Collective',
  createdAt: '2026-08-01T10:05:00Z',
};

const INITIAL_MEMBERSHIPS: TeamMembership[] = [
  {
    id: 'mem-1',
    teamId: 'team-1',
    userId: 'user-owner-1',
    userEmail: 'creator@crew.com',
    role: 'OWNER',
    joinedAt: '2026-08-01T10:05:00Z',
  },
  {
    id: 'mem-2',
    teamId: 'team-1',
    userId: 'user-reviewer-1',
    userEmail: 'reviewer@crew.com',
    role: 'REVIEWER',
    joinedAt: '2026-08-05T14:10:00Z',
  },
];

// Seed drafts with version history (FR-4 & FR-5)
const INITIAL_DRAFTS: Draft[] = [
  {
    id: 'draft-1',
    userId: 'user-owner-1',
    content: 'Stop scrolling: The secret to 10x creative output isn’t more hours, it’s ruthlessly protecting your 8 AM golden focus block. Three rules I never break: 1. Airplane mode on until 10 AM. 2. Only batch-create, never draft in real-time. 3. Warm ambient lighting to cue deep focus. Which one are you trying tomorrow? #StudioAesthetic #FocusBlock #DeepWork',
    tag: 'Productivity & Routine',
    versionNo: 4,
    createdAt: '2026-09-20T11:00:00Z',
    updatedAt: '2026-09-24T15:30:00Z',
    reviewStatus: 'APPROVED',
  },
  {
    id: 'draft-2',
    userId: 'user-owner-1',
    content: 'POV: You stopped trying to please the algorithm and started talking directly to your favorite client. The aesthetic is warm, the advice is blunt, and the results speak for themselves. Tap the link in bio for the complete template. ✨ #CreatorMindset #WarmAesthetic #AuthenticGrowth',
    tag: 'Creator Strategy',
    versionNo: 2,
    createdAt: '2026-09-22T09:00:00Z',
    updatedAt: '2026-09-25T11:20:00Z',
    reviewStatus: 'PENDING',
  },
  {
    id: 'draft-3',
    userId: 'user-owner-1',
    content: 'The minimalist desk upgrade you actually need: Ditch the cable clutter, swap harsh overhead LEDs for warm linen lamps, and keep only one active notepad on your desk. Simplicity breeds clarity. What is your go-to desk essential? 🕯️🪵 #DeskSetup #Minimalism #CreativeWorkspace',
    tag: 'Design & Workspace',
    versionNo: 3,
    createdAt: '2026-09-23T14:15:00Z',
    updatedAt: '2026-09-26T10:00:00Z',
    reviewStatus: 'REWORK',
  },
  {
    id: 'draft-4',
    userId: 'user-owner-1',
    content: 'Quick question for short-form creators: Are you analyzing your 3-second drop-off rate or just hoping the video catches traction? Here is the exact hook formula that retained 78% of viewers past the 15-second mark. #VideoEditing #HookFormula #TikTokGrowth',
    tag: 'Attention Optimization',
    versionNo: 1,
    createdAt: '2026-09-26T16:00:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
    reviewStatus: 'PENDING',
  },
];

// Seed draft versions (last 5 versions per draft - FR-5)
const INITIAL_DRAFT_VERSIONS: DraftVersion[] = [
  {
    id: 'ver-1-1',
    draftId: 'draft-1',
    versionNo: 1,
    content: 'Here is how to get more done in your creative studio. Wake up early and do not look at your phone. Try focus blocks.',
    tag: 'Productivity',
    createdAt: '2026-09-20T11:00:00Z',
    note: 'Initial rough thoughts',
  },
  {
    id: 'ver-1-2',
    draftId: 'draft-1',
    versionNo: 2,
    content: 'Stop scrolling! Creative output isn’t about more hours. It is about protecting your 8 AM block. Rule 1: Airplane mode. Rule 2: Batch create. #Productivity',
    tag: 'Productivity & Routine',
    createdAt: '2026-09-22T14:00:00Z',
    note: 'Added strong hook and numbered rules',
  },
  {
    id: 'ver-1-3',
    draftId: 'draft-1',
    versionNo: 3,
    content: 'Stop scrolling: The secret to 10x creative output isn’t more hours, it’s ruthlessly protecting your 8 AM golden focus block. Three rules: 1. Airplane mode on. 2. Only batch-create. 3. Warm ambient lighting. #DeepWork',
    tag: 'Productivity & Routine',
    createdAt: '2026-09-23T18:00:00Z',
    note: 'Infused studio aesthetic vocabulary',
  },
  {
    id: 'ver-1-4',
    draftId: 'draft-1',
    versionNo: 4,
    content: 'Stop scrolling: The secret to 10x creative output isn’t more hours, it’s ruthlessly protecting your 8 AM golden focus block. Three rules I never break: 1. Airplane mode on until 10 AM. 2. Only batch-create, never draft in real-time. 3. Warm ambient lighting to cue deep focus. Which one are you trying tomorrow? #StudioAesthetic #FocusBlock #DeepWork',
    tag: 'Productivity & Routine',
    createdAt: '2026-09-24T15:30:00Z',
    note: 'Refined engagement CTA question & tags',
  },
  // Draft 2 versions
  {
    id: 'ver-2-1',
    draftId: 'draft-2',
    versionNo: 1,
    content: 'I stopped trying to please the algorithm and my engagement jumped. Just talk to your audience honestly. Link in bio.',
    tag: 'Strategy',
    createdAt: '2026-09-22T09:00:00Z',
    note: 'First outline',
  },
  {
    id: 'ver-2-2',
    draftId: 'draft-2',
    versionNo: 2,
    content: 'POV: You stopped trying to please the algorithm and started talking directly to your favorite client. The aesthetic is warm, the advice is blunt, and the results speak for themselves. Tap the link in bio for the complete template. ✨ #CreatorMindset #WarmAesthetic #AuthenticGrowth',
    tag: 'Creator Strategy',
    createdAt: '2026-09-25T11:20:00Z',
    note: 'Polished POV format and emoji accent',
  },
  // Draft 3 versions
  {
    id: 'ver-3-1',
    draftId: 'draft-3',
    versionNo: 1,
    content: 'Get rid of cables on your desk and buy a nice lamp. It helps you focus.',
    tag: 'Workspace',
    createdAt: '2026-09-23T14:15:00Z',
    note: 'Quick idea dump',
  },
  {
    id: 'ver-3-2',
    draftId: 'draft-3',
    versionNo: 2,
    content: 'The minimalist desk upgrade: Ditch cable clutter, replace overhead lights with warm lamps, and keep one pad on your desk. #DeskSetup',
    tag: 'Workspace',
    createdAt: '2026-09-24T16:00:00Z',
    note: 'Structured into 3 points',
  },
  {
    id: 'ver-3-3',
    draftId: 'draft-3',
    versionNo: 3,
    content: 'The minimalist desk upgrade you actually need: Ditch the cable clutter, swap harsh overhead LEDs for warm linen lamps, and keep only one active notepad on your desk. Simplicity breeds clarity. What is your go-to desk essential? 🕯️🪵 #DeskSetup #Minimalism #CreativeWorkspace',
    tag: 'Design & Workspace',
    createdAt: '2026-09-26T10:00:00Z',
    note: 'Added tone flourishes and closing question',
  },
  // Draft 4 version
  {
    id: 'ver-4-1',
    draftId: 'draft-4',
    versionNo: 1,
    content: 'Quick question for short-form creators: Are you analyzing your 3-second drop-off rate or just hoping the video catches traction? Here is the exact hook formula that retained 78% of viewers past the 15-second mark. #VideoEditing #HookFormula #TikTokGrowth',
    tag: 'Attention Optimization',
    createdAt: '2026-09-26T16:00:00Z',
    note: 'Initial draft for hook optimization',
  },
];

// Initial Style Profile built from the 12 past posts (FR-6)
const INITIAL_STYLE_PROFILE: StyleProfile = {
  id: 'profile-1',
  userId: 'user-owner-1',
  sampleCount: 12,
  dominantTone: 'Aesthetic',
  toneVector: {
    funny: 0.15,
    professional: 0.35,
    aesthetic: 0.85,
    hookIntensity: 0.78,
    emojiFrequency: 0.42,
  },
  topKeywords: [
    'studio routine',
    'golden focus block',
    'warm linen',
    'aesthetic',
    'unpopular opinion',
    'batch-create',
    'effortless',
    'burnout prevention',
    'creative systems',
  ],
  avgWordCount: 38,
  voiceSummary:
    'Distinctive aesthetic-creator voice: Combines calm, intentional lifestyle visual cues (linen lighting, lo-fi, studio vibe) with punchy, actionable productivity frameworks and clear conversational questions.',
  updatedAt: '2026-09-26T12:00:00Z',
};

// Initial platform connections
const INITIAL_PLATFORMS: PlatformConnection[] = [
  {
    id: 'plat-1',
    userId: 'user-owner-1',
    platform: 'instagram',
    isAuthorized: true,
    platformUsername: '@mahek.creates',
    lastSyncedAt: '2026-09-26T12:00:00Z',
  },
  {
    id: 'plat-2',
    userId: 'user-owner-1',
    platform: 'tiktok',
    isAuthorized: true,
    platformUsername: '@mahek_tok',
    lastSyncedAt: '2026-09-26T12:00:00Z',
  },
  {
    id: 'plat-3',
    userId: 'user-owner-1',
    platform: 'youtube',
    isAuthorized: false, // Disconnected to demonstrate FR-9 reminder fallback
    platformUsername: '',
    lastSyncedAt: '',
  },
];

// Seed draft review log (FR-11)
const INITIAL_REVIEWS: DraftReview[] = [
  {
    id: 'rev-1',
    draftId: 'draft-1',
    draftTitleSnippet: 'Stop scrolling: The secret to 10x creative output...',
    reviewerId: 'user-reviewer-1',
    reviewerEmail: 'reviewer@crew.com',
    decision: 'APPROVED',
    feedback: 'Fantastic flow and matches our warm studio brand guidelines perfectly. Ready to schedule.',
    decidedAt: '2026-09-25T16:00:00Z',
  },
  {
    id: 'rev-2',
    draftId: 'draft-3',
    draftTitleSnippet: 'The minimalist desk upgrade you actually need...',
    reviewerId: 'user-reviewer-1',
    reviewerEmail: 'reviewer@crew.com',
    decision: 'REWORK',
    feedback: 'Great topic, but could we add an explicit product link mention or mention the linen shade lamp model?',
    decidedAt: '2026-09-26T10:30:00Z',
  },
];

// Seed scheduled posts (FR-7 & FR-9)
const INITIAL_SCHEDULED: ScheduledPost[] = [
  {
    id: 'sched-1',
    draftId: 'draft-1',
    userId: 'user-owner-1',
    platform: 'instagram',
    scheduledTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 mins from now
    status: 'PENDING',
    autoPublish: true,
    formattedContent: `Stop scrolling: The secret to 10x creative output isn’t more hours, it’s ruthlessly protecting your 8 AM golden focus block.

Three rules I never break:
1. Airplane mode on until 10 AM.
2. Only batch-create, never draft in real-time.
3. Warm ambient lighting to cue deep focus.

Which one are you trying tomorrow?

.
.
#StudioAesthetic #FocusBlock #DeepWork #CreatorRoutine`,
    reminderSent: false,
    createdAt: '2026-09-26T10:00:00Z',
  },
  {
    id: 'sched-2',
    draftId: 'draft-2',
    userId: 'user-owner-1',
    platform: 'tiktok',
    scheduledTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    status: 'PENDING',
    autoPublish: true,
    formattedContent: `POV: You stopped trying to please the algorithm and started talking directly to your favorite client ✨ Results speak for themselves! Link in bio. #CreatorMindset #WarmAesthetic #AuthenticGrowth`,
    reminderSent: false,
    createdAt: '2026-09-26T11:00:00Z',
  },
  {
    id: 'sched-3',
    draftId: 'draft-3',
    userId: 'user-owner-1',
    platform: 'youtube',
    scheduledTime: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    status: 'PENDING',
    autoPublish: false, // Platform disconnected -> Reminder will fire
    formattedContent: `The minimalist desk upgrade you actually need: Ditch the cable clutter, swap harsh overhead LEDs for warm linen lamps, and keep only one active notepad on your desk. Simplicity breeds clarity.\n\nSubscribe for more studio design and creative workflows.`,
    reminderSent: false,
    createdAt: '2026-09-26T12:00:00Z',
  },
];

// Seed engagement data for previously published post (FR-12)
const INITIAL_ENGAGEMENT: EngagementData[] = [
  {
    id: 'eng-1',
    scheduledPostId: 'sched-1',
    likes: 3840,
    comments: 295,
    shares: 940,
    watchTime: '84% completion rate',
    collectedAt: '2026-09-26T22:00:00Z',
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // Initialize store with demo data if empty
  public initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
      this.set(STORAGE_KEYS.CURRENT_USER_ID, 'user-owner-1');
      this.set(STORAGE_KEYS.DRAFTS, INITIAL_DRAFTS);
      this.set(STORAGE_KEYS.DRAFT_VERSIONS, INITIAL_DRAFT_VERSIONS);
      this.set(STORAGE_KEYS.PAST_POSTS, INITIAL_PAST_POSTS);
      this.set(STORAGE_KEYS.STYLE_PROFILES, [INITIAL_STYLE_PROFILE]);
      this.set(STORAGE_KEYS.TEAMS, [INITIAL_TEAM]);
      this.set(STORAGE_KEYS.TEAM_MEMBERSHIPS, INITIAL_MEMBERSHIPS);
      this.set(STORAGE_KEYS.DRAFT_REVIEWS, INITIAL_REVIEWS);
      this.set(STORAGE_KEYS.PLATFORMS, INITIAL_PLATFORMS);
      this.set(STORAGE_KEYS.SCHEDULED_POSTS, INITIAL_SCHEDULED);
      this.set(STORAGE_KEYS.ENGAGEMENT_DATA, INITIAL_ENGAGEMENT);
      this.set(STORAGE_KEYS.OTP_LOGS, []);
    }
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.get<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-owner-1');
    const user = users.find((u) => u.id === currentId);
    return user || users[0] || INITIAL_USERS[0];
  }

  public setCurrentUserId(id: string): void {
    this.set(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  public addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.set(STORAGE_KEYS.USERS, users);
    this.setCurrentUserId(user.id);
  }

  public updateUser(user: User): void {
    const users = this.getUsers().map((u) => (u.id === user.id ? user : u));
    this.set(STORAGE_KEYS.USERS, users);
  }

  // --- OTP Logs ---
  public logOtp(email: string, mobile: string, otp: string): void {
    const logs = this.get<OtpLog[]>(STORAGE_KEYS.OTP_LOGS, []);
    logs.unshift({
      id: `otp-${Date.now()}`,
      email,
      mobile,
      otp,
      timestamp: new Date().toLocaleTimeString(),
    });
    this.set(STORAGE_KEYS.OTP_LOGS, logs.slice(0, 10));
    console.log(`[AUTH SERVER OTP CONSOLE] Generated OTP for ${email} (${mobile}): ${otp}`);
  }

  public getOtpLogs(): OtpLog[] {
    return this.get<OtpLog[]>(STORAGE_KEYS.OTP_LOGS, []);
  }

  // --- Drafts (FR-4 & FR-5) ---
  public getDrafts(userId?: string): Draft[] {
    const drafts = this.get<Draft[]>(STORAGE_KEYS.DRAFTS, INITIAL_DRAFTS);
    if (userId) {
      return drafts.filter((d) => d.userId === userId);
    }
    return drafts;
  }

  public getDraftById(id: string): Draft | undefined {
    return this.getDrafts().find((d) => d.id === id);
  }

  public saveDraft(content: string, tag?: string, userId?: string): Draft {
    const currentUserId = userId || this.getCurrentUser().id;
    const drafts = this.getDrafts();
    
    // Auto-generate tag if omitted (FR-4)
    const detectedTag = tag || this.autoDetectTag(content);

    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      userId: currentUserId,
      content,
      tag: detectedTag,
      versionNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewStatus: 'PENDING',
    };

    drafts.unshift(newDraft);
    this.set(STORAGE_KEYS.DRAFTS, drafts);

    // Save initial version into DraftVersion (FR-5)
    this.saveDraftVersion(newDraft.id, 1, content, detectedTag, 'Initial saved draft');

    return newDraft;
  }

  public updateDraft(draftId: string, newContent: string, newTag?: string, changeNote?: string): Draft {
    const drafts = this.getDrafts();
    const index = drafts.findIndex((d) => d.id === draftId);
    if (index === -1) throw new Error('Draft not found');

    const currentDraft = drafts[index];
    const newVersionNo = currentDraft.versionNo + 1;
    const tag = newTag || currentDraft.tag;

    const updated: Draft = {
      ...currentDraft,
      content: newContent,
      tag,
      versionNo: newVersionNo,
      updatedAt: new Date().toISOString(),
    };

    drafts[index] = updated;
    this.set(STORAGE_KEYS.DRAFTS, drafts);

    // Record version and keep only last 5 (FR-5)
    this.saveDraftVersion(draftId, newVersionNo, newContent, tag, changeNote || `Version ${newVersionNo}`);

    return updated;
  }

  public deleteDraft(draftId: string): void {
    const drafts = this.getDrafts().filter((d) => d.id !== draftId);
    this.set(STORAGE_KEYS.DRAFTS, drafts);
  }

  public searchDrafts(query: string, tagFilter?: string): Draft[] {
    const drafts = this.getDrafts();
    const q = query.trim().toLowerCase();
    return drafts.filter((d) => {
      const matchesQuery = !q || d.content.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q);
      const matchesTag = !tagFilter || tagFilter === 'All' || d.tag === tagFilter;
      return matchesQuery && matchesTag;
    });
  }

  // --- Draft Versions (FR-5: Retain last 5 versions) ---
  public getDraftVersions(draftId: string): DraftVersion[] {
    const versions = this.get<DraftVersion[]>(STORAGE_KEYS.DRAFT_VERSIONS, INITIAL_DRAFT_VERSIONS);
    return versions
      .filter((v) => v.draftId === draftId)
      .sort((a, b) => b.versionNo - a.versionNo);
  }

  public saveDraftVersion(draftId: string, versionNo: number, content: string, tag: string, note?: string): void {
    const allVersions = this.get<DraftVersion[]>(STORAGE_KEYS.DRAFT_VERSIONS, INITIAL_DRAFT_VERSIONS);
    
    const newVersion: DraftVersion = {
      id: `ver-${draftId}-${versionNo}-${Date.now()}`,
      draftId,
      versionNo,
      content,
      tag,
      createdAt: new Date().toISOString(),
      note,
    };

    allVersions.push(newVersion);

    // Retain only the last 5 versions for this specific draft
    const thisDraftVersions = allVersions.filter((v) => v.draftId === draftId);
    const otherDraftVersions = allVersions.filter((v) => v.draftId !== draftId);

    thisDraftVersions.sort((a, b) => b.versionNo - a.versionNo);
    const retained = thisDraftVersions.slice(0, 5);

    this.set(STORAGE_KEYS.DRAFT_VERSIONS, [...otherDraftVersions, ...retained]);
  }

  public revertDraftToVersion(draftId: string, versionNo: number): Draft {
    const versions = this.getDraftVersions(draftId);
    const targetVersion = versions.find((v) => v.versionNo === versionNo);
    if (!targetVersion) throw new Error(`Version ${versionNo} not found for draft ${draftId}`);

    return this.updateDraft(
      draftId,
      targetVersion.content,
      targetVersion.tag,
      `Reverted back to version ${versionNo}`
    );
  }

  // --- Style Memory (FR-6) ---
  public getPastPosts(userId?: string): PastPost[] {
    const targetUserId = userId || this.getCurrentUser().id;
    const posts = this.get<PastPost[]>(STORAGE_KEYS.PAST_POSTS, INITIAL_PAST_POSTS);
    return posts.filter((p) => p.userId === targetUserId);
  }

  public addPastPost(post: Omit<PastPost, 'id'>): PastPost {
    const posts = this.get<PastPost[]>(STORAGE_KEYS.PAST_POSTS, INITIAL_PAST_POSTS);
    const newPost: PastPost = {
      ...post,
      id: `post-${Date.now()}`,
    };
    posts.unshift(newPost);
    this.set(STORAGE_KEYS.PAST_POSTS, posts);
    // Recalculate style profile when new posts are added
    this.rebuildStyleProfile(newPost.userId);
    return newPost;
  }

  public getStyleProfile(userId?: string): StyleProfile {
    const targetUserId = userId || this.getCurrentUser().id;
    const profiles = this.get<StyleProfile[]>(STORAGE_KEYS.STYLE_PROFILES, [INITIAL_STYLE_PROFILE]);
    const found = profiles.find((p) => p.userId === targetUserId);
    if (found) return found;

    // Build fresh profile if missing
    return this.rebuildStyleProfile(targetUserId);
  }

  public rebuildStyleProfile(userId: string): StyleProfile {
    const pastPosts = this.getPastPosts(userId);
    const sampleCount = pastPosts.length;

    // Extract vocabulary
    const allWords = pastPosts
      .map((p) => p.content.toLowerCase())
      .join(' ')
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);

    const wordCounts: Record<string, number> = {};
    allWords.forEach((w) => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);

    const avgWordCount =
      sampleCount > 0
        ? Math.round(
            pastPosts.reduce((acc, p) => acc + p.content.split(/\s+/).length, 0) / sampleCount
          )
        : 35;

    const user = this.getCurrentUser();
    const dominantTone = user.brandTone || 'Aesthetic';

    const newProfile: StyleProfile = {
      id: `profile-${userId}`,
      userId,
      sampleCount,
      dominantTone,
      toneVector: {
        funny: dominantTone === 'Funny' ? 0.8 : 0.2,
        professional: dominantTone === 'Professional' ? 0.85 : 0.3,
        aesthetic: dominantTone === 'Aesthetic' ? 0.88 : 0.4,
        hookIntensity: 0.82,
        emojiFrequency: 0.45,
      },
      topKeywords: topKeywords.length > 0 ? topKeywords : INITIAL_STYLE_PROFILE.topKeywords,
      avgWordCount,
      voiceSummary: `Calibrated from ${sampleCount} past posts: Favors ${dominantTone.toLowerCase()} framing, ~${avgWordCount} words, and high retention openers.`,
      updatedAt: new Date().toISOString(),
    };

    const profiles = this.get<StyleProfile[]>(STORAGE_KEYS.STYLE_PROFILES, [INITIAL_STYLE_PROFILE]);
    const filtered = profiles.filter((p) => p.userId !== userId);
    filtered.push(newProfile);
    this.set(STORAGE_KEYS.STYLE_PROFILES, filtered);

    return newProfile;
  }

  // --- Platform Connections (FR-9) ---
  public getPlatformConnections(userId?: string): PlatformConnection[] {
    const targetUserId = userId || this.getCurrentUser().id;
    const conns = this.get<PlatformConnection[]>(STORAGE_KEYS.PLATFORMS, INITIAL_PLATFORMS);
    return conns.filter((c) => c.userId === targetUserId);
  }

  public togglePlatformConnection(platform: 'instagram' | 'tiktok' | 'youtube', userId?: string): PlatformConnection {
    const targetUserId = userId || this.getCurrentUser().id;
    const conns = this.get<PlatformConnection[]>(STORAGE_KEYS.PLATFORMS, INITIAL_PLATFORMS);
    const existing = conns.find((c) => c.userId === targetUserId && c.platform === platform);

    if (existing) {
      existing.isAuthorized = !existing.isAuthorized;
      existing.lastSyncedAt = new Date().toISOString();
      if (existing.isAuthorized && !existing.platformUsername) {
        existing.platformUsername = `@creator.${platform}`;
      }
    } else {
      conns.push({
        id: `plat-${Date.now()}`,
        userId: targetUserId,
        platform,
        isAuthorized: true,
        platformUsername: `@creator.${platform}`,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    this.set(STORAGE_KEYS.PLATFORMS, conns);
    return existing || conns[conns.length - 1];
  }

  // --- Scheduled Posts (FR-7, FR-8, FR-9) ---
  public getScheduledPosts(): ScheduledPost[] {
    return this.get<ScheduledPost[]>(STORAGE_KEYS.SCHEDULED_POSTS, INITIAL_SCHEDULED);
  }

  public schedulePost(
    draftId: string,
    platform: 'instagram' | 'tiktok' | 'youtube',
    scheduledTime: string,
    formattedContent: string,
    autoPublish: boolean
  ): ScheduledPost {
    const currentUserId = this.getCurrentUser().id;
    const scheduled = this.getScheduledPosts();

    const newPost: ScheduledPost = {
      id: `sched-${Date.now()}`,
      draftId,
      userId: currentUserId,
      platform,
      scheduledTime,
      status: 'PENDING',
      autoPublish,
      formattedContent,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    scheduled.unshift(newPost);
    this.set(STORAGE_KEYS.SCHEDULED_POSTS, scheduled);
    return newPost;
  }

  public publishPostNow(scheduledPostId: string): ScheduledPost {
    const scheduled = this.getScheduledPosts();
    const index = scheduled.findIndex((p) => p.id === scheduledPostId);
    if (index === -1) throw new Error('Post not found');

    scheduled[index].status = 'PUBLISHED';
    scheduled[index].publishedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.SCHEDULED_POSTS, scheduled);

    // Create synthetic engagement data after publishing (FR-12)
    this.generateSimulatedEngagement(scheduledPostId);

    return scheduled[index];
  }

  // --- Engagement Data & Feedback Loop (FR-12) ---
  public getEngagementData(): EngagementData[] {
    return this.get<EngagementData[]>(STORAGE_KEYS.ENGAGEMENT_DATA, INITIAL_ENGAGEMENT);
  }

  public generateSimulatedEngagement(scheduledPostId: string): EngagementData {
    const all = this.getEngagementData();
    const existing = all.find((e) => e.scheduledPostId === scheduledPostId);
    if (existing) return existing;

    const baseLikes = Math.floor(Math.random() * 5000) + 1200;
    const comments = Math.floor(baseLikes * (0.05 + Math.random() * 0.05));
    const shares = Math.floor(baseLikes * (0.15 + Math.random() * 0.15));
    const retention = Math.floor(70 + Math.random() * 25);

    const newEngagement: EngagementData = {
      id: `eng-${Date.now()}`,
      scheduledPostId,
      likes: baseLikes,
      comments,
      shares,
      watchTime: `${retention}% avg retention`,
      collectedAt: new Date().toISOString(),
    };

    all.unshift(newEngagement);
    this.set(STORAGE_KEYS.ENGAGEMENT_DATA, all);

    // Trigger instant update to Style Profile & Scheduler (FR-12)
    const currentUser = this.getCurrentUser();
    this.rebuildStyleProfile(currentUser.id);

    return newEngagement;
  }

  // --- Team Collaboration (FR-11) ---
  public getTeams(): Team[] {
    return this.get<Team[]>(STORAGE_KEYS.TEAMS, [INITIAL_TEAM]);
  }

  public getTeamMemberships(teamId?: string): TeamMembership[] {
    const all = this.get<TeamMembership[]>(STORAGE_KEYS.TEAM_MEMBERSHIPS, INITIAL_MEMBERSHIPS);
    if (teamId) {
      return all.filter((m) => m.teamId === teamId);
    }
    return all;
  }

  public inviteTeamMember(email: string, role: 'OWNER' | 'REVIEWER' = 'REVIEWER'): TeamMembership {
    const allMemberships = this.getTeamMemberships();
    const team = this.getTeams()[0];

    const newMember: TeamMembership = {
      id: `mem-${Date.now()}`,
      teamId: team.id,
      userId: `user-inv-${Date.now()}`,
      userEmail: email,
      role,
      joinedAt: new Date().toISOString(),
    };

    allMemberships.push(newMember);
    this.set(STORAGE_KEYS.TEAM_MEMBERSHIPS, allMemberships);
    return newMember;
  }

  public getDraftReviews(): DraftReview[] {
    return this.get<DraftReview[]>(STORAGE_KEYS.DRAFT_REVIEWS, INITIAL_REVIEWS);
  }

  public submitDraftReview(
    draftId: string,
    decision: 'APPROVED' | 'REWORK' | 'DISCARDED' | 'PENDING',
    feedback?: string
  ): DraftReview {
    const currentUser = this.getCurrentUser();
    const draft = this.getDraftById(draftId);
    const reviews = this.getDraftReviews();

    const titleSnippet = draft ? draft.content.slice(0, 48) + '...' : 'Draft #' + draftId;

    const newReview: DraftReview = {
      id: `rev-${Date.now()}`,
      draftId,
      draftTitleSnippet: titleSnippet,
      reviewerId: currentUser.id,
      reviewerEmail: currentUser.email,
      decision,
      feedback,
      decidedAt: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    this.set(STORAGE_KEYS.DRAFT_REVIEWS, reviews);

    // Update draft status
    if (draft) {
      draft.reviewStatus = decision;
      const drafts = this.getDrafts();
      const idx = drafts.findIndex((d) => d.id === draftId);
      if (idx !== -1) {
        drafts[idx].reviewStatus = decision;
        this.set(STORAGE_KEYS.DRAFTS, drafts);
      }
    }

    return newReview;
  }

  private autoDetectTag(content: string): string {
    const text = content.toLowerCase();
    if (text.includes('routine') || text.includes('habit') || text.includes('productive') || text.includes('focus')) {
      return 'Productivity & Routine';
    }
    if (text.includes('growth') || text.includes('algorithm') || text.includes('audience') || text.includes('creator')) {
      return 'Creator Strategy';
    }
    if (text.includes('desk') || text.includes('aesthetic') || text.includes('lamp') || text.includes('studio') || text.includes('minimal')) {
      return 'Design & Workspace';
    }
    if (text.includes('hook') || text.includes('retention') || text.includes('drop-off') || text.includes('video')) {
      return 'Attention Optimization';
    }
    return 'General Ideas';
  }
}

export const storage = new StorageService();

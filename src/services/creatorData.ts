export interface CreatorPost {
  id: number;
  date: string;
  hour: number;
  format: 'Reel' | 'Carousel' | 'Photo';
  topic: string;
  caption: string;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  eng: number;
  duration: number;
  curve: number[] | null;
  vsAvg: number;
}

export interface DailyReach {
  date: string;
  reach: number;
}

export interface BestCell {
  date: string;
  off: number;
  hour: number;
  score: number;
  dow: number;
  d: Date;
}

export interface ContentIdea {
  id: string;
  format: 'Reel' | 'Carousel' | 'Photo';
  topic: string;
  lift: number;
  title: string;
  why: string;
}

export interface ScheduledItem {
  id: number;
  draftId: number;
  date: string;
  hour: number;
  auto: boolean;
}

export interface DraftVersionItem {
  versionNo: number;
  text: string;
  note: string;
  date: string;
}

export interface VaultDraft {
  id: number;
  text: string;
  tags: string;
  tone: string;
  versionNo?: number;
  versions?: DraftVersionItem[];
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REWORK' | 'DISCARDED';
  reviewFeedback?: string;
  reviewerEmail?: string;
  reviewedAt?: string;
}

export interface TeamMember {
  id: string;
  email: string;
  role: 'OWNER' | 'REVIEWER';
  joinedAt: string;
}

export interface AuditLogEntry {
  id: string;
  draftId: number;
  draftTitle: string;
  decision: 'APPROVED' | 'REWORK' | 'DISCARDED';
  feedback?: string;
  by: string;
  time: string;
}

export interface BrandGuardConfig {
  minStyleMatch: number;
  requireApprovalToPublish: boolean;
  sendReminderInsteadOfPublish: boolean;
  bannedWords: string[];
}

export interface CreatorState {
  connected: boolean;
  allowPublish: boolean;
  drafts: VaultDraft[];
  nextId: number;
  schedule: ScheduledItem[];
  goals: { weekly: number; reach: number };
  dismissed: string[];
  teamMembers: TeamMember[];
  currentRole: 'OWNER' | 'REVIEWER';
  auditLog: AuditLogEntry[];
  brandGuard: BrandGuardConfig;
}

function rng(seed: number) {
  return function () {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const r = rng(42);
const pick = <T>(a: T[]): T => a[Math.floor(r() * a.length)];
const TOPICS = [
  'Morning routine',
  'Behind the scenes',
  'Desk setup',
  'Budget finds',
  'Day in my life',
  'Recipe',
  'Travel',
];
const TOPIC_LIFT: Record<string, number> = {
  'Behind the scenes': 1.7,
  'Morning routine': 1.3,
  'Desk setup': 1.0,
  'Budget finds': 0.9,
  'Day in my life': 1.1,
  Recipe: 0.8,
  Travel: 0.7,
};
const BASE_REACH = { Reel: 4200, Carousel: 2600, Photo: 1500 };
const HOURS = [8, 12, 18, 19, 20, 21];
const HOOKS = [
  'Nobody tells you this about',
  'I tried',
  '3 things I changed in',
  'Stop scrolling: my',
  'The honest truth about',
];

const today = new Date();
today.setHours(0, 0, 0, 0);

// Generate 40 deterministic posts matching data.js
const posts: CreatorPost[] = [];
for (let i = 0; i < 40; i++) {
  const fmt: 'Reel' | 'Carousel' | 'Photo' =
    r() < 0.5 ? 'Reel' : r() < 0.6 ? 'Carousel' : 'Photo';
  const topic = pick(TOPICS);
  const d = new Date(today);
  d.setDate(d.getDate() - (1 + Math.floor(i * 1.4)));
  const reach = Math.round(BASE_REACH[fmt] * TOPIC_LIFT[topic] * (0.75 + r() * 0.5));
  const likes = Math.round(reach * (0.05 + r() * 0.04));
  const comments = Math.round(reach * (0.004 + r() * 0.006));
  const saves = Math.round(
    reach * (0.01 + r() * 0.02) * (topic === 'Behind the scenes' ? 1.8 : 1)
  );
  const shares = Math.round(reach * (0.005 + r() * 0.012));
  const duration = fmt === 'Reel' ? 15 + Math.floor(r() * 40) : 0;
  let curve: number[] | null = null;
  if (fmt === 'Reel') {
    curve = [100];
    const dropAt = 2 + Math.floor(r() * 5);
    const bigDrop = 18 + Math.floor(r() * 14);
    for (let k = 1; k <= 10; k++) {
      const step = 3 + r() * 5 + (k === dropAt ? bigDrop : 0);
      curve.push(Math.max(5, Math.round(curve[k - 1] - step)));
    }
  }
  const hook = pick(HOOKS);
  posts.push({
    id: i + 1,
    date: d.toISOString().slice(0, 10),
    hour: pick(HOURS),
    format: fmt,
    topic: topic,
    caption: `${hook} ${topic.toLowerCase()}`,
    reach,
    likes,
    comments,
    saves,
    shares,
    eng: (likes + comments * 2 + saves * 3 + shares * 4) / reach,
    duration,
    curve,
    vsAvg: 1,
  });
}

const avgEng = posts.reduce((s, p) => s + p.eng, 0) / posts.length;
posts.forEach((p) => {
  p.vsAvg = p.eng / avgEng;
});

// Daily reach for 56 days
const daily: DailyReach[] = [];
for (let j = 55; j >= 0; j--) {
  const dd = new Date(today);
  dd.setDate(dd.getDate() - j);
  const trend = 1500 + (55 - j) * 22;
  const wiggle = (r() - 0.5) * 700;
  const onPost = posts.some((p) => p.date === dd.toISOString().slice(0, 10));
  daily.push({
    date: dd.toISOString().slice(0, 10),
    reach: Math.round(trend + wiggle + (onPost ? 1800 : 0)),
  });
}

// Follower activity heatmap (7 days Mon..Sun x 6 time bands)
const BANDS = [6, 9, 12, 15, 18, 21];
const heat: number[][] = [];
for (let dy = 0; dy < 7; dy++) {
  const row: number[] = [];
  for (let b = 0; b < 6; b++) {
    let v = 28 + r() * 14;
    if (b >= 4 && dy < 5) v += 30; // weekday evenings
    if (dy >= 5 && b === 2) v += 36; // weekend midday
    if (b === 0) v -= 14;
    row.push(Math.max(8, Math.min(100, Math.round(v))));
  }
  heat.push(row);
}

export const creatorData = {
  handle: 'mira.makes',
  name: 'Mira',
  followers: 18400,
  today,
  posts,
  daily,
  heat,
  bands: BANDS,
  avgEng,
  topics: TOPICS,
};

// State storage helpers
const STORAGE_KEY = 'cc-state';

export function getInitialState(): CreatorState {
  const defaultDrafts: VaultDraft[] = [
    {
      id: 1,
      text: '3 things I changed in my morning routine (and the one I quit). Save this for tomorrow.',
      tags: '#morningroutine #creatorlife #deepwork',
      tone: 'Motivational',
      versionNo: 2,
      versions: [
        {
          versionNo: 1,
          text: '3 routine changes: wake up at 5, hydrate, write 15 mins.',
          note: 'Initial bullet point idea dump',
          date: '2026-10-18',
        },
        {
          versionNo: 2,
          text: '3 things I changed in my morning routine (and the one I quit). Save this for tomorrow.',
          note: 'Added curiosity hook and explicit save CTA',
          date: '2026-10-20',
        },
      ],
      reviewStatus: 'PENDING',
    },
    {
      id: 2,
      text: 'Behind the scenes of a 20-second Reel: 41 takes, 1 keeper.',
      tags: '#behindthescenes #reels #creatorcrew',
      tone: 'Funny',
      versionNo: 2,
      versions: [
        {
          versionNo: 1,
          text: 'Behind the scenes: It took so many takes to film this short reel!',
          note: 'First draft outline',
          date: '2026-10-19',
        },
        {
          versionNo: 2,
          text: 'Behind the scenes of a 20-second Reel: 41 takes, 1 keeper.',
          note: 'Sharp contrast hook for higher retention',
          date: '2026-10-21',
        },
      ],
      reviewStatus: 'APPROVED',
      reviewerEmail: 'reviewer@crew.com',
      reviewedAt: '2026-10-21T14:30:00Z',
    },
    {
      id: 3,
      text: "My desk setup under $200: what I'd buy again.",
      tags: '#desksetup #budgetfinds #minimalist',
      tone: 'Professional',
      versionNo: 1,
      versions: [
        {
          versionNo: 1,
          text: "My desk setup under $200: what I'd buy again.",
          note: 'Initial budget breakdown',
          date: '2026-10-21',
        },
      ],
      reviewStatus: 'REWORK',
      reviewFeedback: 'Add specific product price tags and mention lighting model.',
      reviewerEmail: 'reviewer@crew.com',
      reviewedAt: '2026-10-22T08:00:00Z',
    },
  ];

  const defaultMembers: TeamMember[] = [
    { id: 'tm-1', email: 'mira@makes.creator', role: 'OWNER', joinedAt: '2026-08-01' },
    { id: 'tm-2', email: 'reviewer@crew.com', role: 'REVIEWER', joinedAt: '2026-08-15' },
    { id: 'tm-3', email: 'alex@creatorcrew.studio', role: 'REVIEWER', joinedAt: '2026-09-02' },
  ];

  const defaultAuditLog: AuditLogEntry[] = [
    {
      id: 'log-1',
      draftId: 2,
      draftTitle: 'Behind the scenes of a 20-second Reel: 41 takes, 1 keeper.',
      decision: 'APPROVED',
      feedback: 'Verified tone matches brand voice guidelines.',
      by: 'reviewer@crew.com',
      time: '2026-10-21 14:30',
    },
    {
      id: 'log-2',
      draftId: 3,
      draftTitle: "My desk setup under $200: what I'd buy again.",
      decision: 'REWORK',
      feedback: 'Add specific product price tags and mention lighting model.',
      by: 'reviewer@crew.com',
      time: '2026-10-22 08:00',
    },
  ];

  const defaultBrandGuard: BrandGuardConfig = {
    minStyleMatch: 75,
    requireApprovalToPublish: true,
    sendReminderInsteadOfPublish: false,
    bannedWords: ['revolutionary', 'game-changer', 'unprecedented', 'synergy'],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.goals) {
        return {
          ...parsed,
          teamMembers: parsed.teamMembers || defaultMembers,
          currentRole: parsed.currentRole || 'OWNER',
          auditLog: parsed.auditLog || defaultAuditLog,
          brandGuard: parsed.brandGuard || defaultBrandGuard,
          drafts: (parsed.drafts || defaultDrafts).map((d: any, idx: number) => ({
            ...d,
            versionNo: d.versionNo || 1,
            versions: d.versions || [
              {
                versionNo: 1,
                text: d.text,
                note: 'Initial draft version',
                date: '2026-10-20',
              },
            ],
            reviewStatus: d.reviewStatus || (idx === 1 ? 'APPROVED' : idx === 2 ? 'REWORK' : 'PENDING'),
          })),
        };
      }
    }
  } catch (e) {
    console.error('Error loading creator state:', e);
  }

  return {
    connected: false,
    allowPublish: true,
    drafts: defaultDrafts,
    nextId: 4,
    schedule: [],
    goals: { weekly: 4, reach: 120000 },
    dismissed: [],
    teamMembers: defaultMembers,
    currentRole: 'OWNER',
    auditLog: defaultAuditLog,
    brandGuard: defaultBrandGuard,
  };
}

export function saveState(state: CreatorState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const hourLabel = (h: number): string =>
  (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? ' AM' : ' PM');

export const iso = (d: Date): string => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export const dayIdx = (d: Date): number => (d.getDay() + 6) % 7; // Mon=0

export const fmtNumber = (n: number): string => n.toLocaleString('en-US');

export const fmtDate = (s: string): string => {
  const d = new Date(s + 'T00:00:00');
  return d.getDate() + ' ' + MONTHS[d.getMonth()];
};

export function postsThisWeek(): number {
  const d = new Date(creatorData.today);
  d.setDate(d.getDate() - dayIdx(d));
  const ws = iso(d);
  return creatorData.posts.filter((p) => p.date >= ws).length;
}

export function reach28(): number {
  return creatorData.daily.slice(-28).reduce((s, x) => s + x.reach, 0);
}

export function avgOf<T>(a: T[], k: keyof T): number {
  return a.reduce((s, p) => s + (p[k] as unknown as number), 0) / (a.length || 1);
}

export function avgOfHeat(): number {
  const flat = creatorData.heat.flat();
  return flat.reduce((s, v) => s + v, 0) / flat.length;
}

export function bestCells(): BestCell[] {
  const now = new Date();
  const out: BestCell[] = [];
  for (let off = 0; off < 7; off++) {
    const d = new Date(creatorData.today);
    d.setDate(d.getDate() + off);
    creatorData.bands.forEach((h, b) => {
      if (off === 0 && h <= now.getHours()) return;
      out.push({
        date: iso(d),
        off,
        hour: h,
        score: creatorData.heat[dayIdx(d)][b],
        dow: dayIdx(d),
        d,
      });
    });
  }
  out.sort((a, b) => b.score - a.score || a.off - b.off);
  return out;
}

export function slotText(c: BestCell): string {
  return (c.off === 0 ? 'Today' : c.off === 1 ? 'Tomorrow' : DAYS[c.dow]) + ' ' + hourLabel(c.hour);
}

export function comboStats() {
  const m: Record<string, CreatorPost[]> = {};
  creatorData.posts.forEach((p) => {
    const k = p.topic + '|' + p.format;
    (m[k] = m[k] || []).push(p);
  });
  return Object.keys(m)
    .map((k) => {
      const a = m[k];
      return {
        topic: k.split('|')[0],
        format: k.split('|')[1] as 'Reel' | 'Carousel' | 'Photo',
        n: a.length,
        lift: avgOf(a, 'vsAvg'),
        saves: avgOf(a, 'saves') / avgOf(a, 'reach'),
      };
    })
    .filter((c) => c.n >= 2)
    .sort((a, b) => b.lift - a.lift);
}

export function getIdeas(dismissed: string[] = []): ContentIdea[] {
  const list: ContentIdea[] = comboStats()
    .slice(0, 4)
    .map((c, i) => ({
      id: 'c' + i,
      format: c.format,
      topic: c.topic,
      lift: c.lift,
      title: 'A ' + c.format.toLowerCase() + ' on ' + c.topic.toLowerCase(),
      why:
        c.n +
        ' of your ' +
        c.format.toLowerCase() +
        's on this topic earned ' +
        c.lift.toFixed(1) +
        '× your average engagement.',
    }));

  const lastCar = creatorData.posts.filter((p) => p.format === 'Carousel')[0];
  if (lastCar) {
    const gap = Math.round(
      (creatorData.today.getTime() - new Date(lastCar.date).getTime()) / 864e5
    );
    if (gap >= 5) {
      list.push({
        id: 'g1',
        format: 'Carousel',
        topic: 'Budget finds',
        lift: 0,
        title: 'Bring back a carousel this week',
        why:
          'Your last carousel was ' +
          gap +
          ' days ago. Carousels get you the most saves per view.',
      });
    }
  }
  return list.filter((i) => dismissed.indexOf(i.id) < 0);
}

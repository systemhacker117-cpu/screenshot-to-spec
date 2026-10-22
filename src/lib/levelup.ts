export const XP = { mood: 10, goal: 5 } as const;

/** Level N -> N+1 needs 100*N XP. Returns level and progress within it. */
export function levelInfo(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= level * 100) {
    remaining -= level * 100;
    level++;
  }
  return { level, into: remaining, needed: level * 100 };
}

export function todayKey(d = new Date()) {
  return d.toLocaleDateString("en-CA");
}

export function yesterdayKey(d = new Date()) {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

/** Streak counts consecutive days with at least one XP action. */
export function nextStreak(streak: number, lastActive: string | null, now = new Date()) {
  const t = todayKey(now);
  if (lastActive === t) return streak;
  if (lastActive === yesterdayKey(now)) return streak + 1;
  return 1;
}

export type Goal = { id: string; date: string; title: string; done: boolean };
export type MoodEntry = { date: string; mood: number; note: string };
export type State = {
  name: string;
  interests: string[];
  xp: number;
  streak: number;
  lastActive: string | null;
  moods: MoodEntry[];
  goals: Goal[];
  badges: string[];
};

export const emptyState = (name: string, interests: string[]): State => ({
  name,
  interests,
  xp: 0,
  streak: 0,
  lastActive: null,
  moods: [],
  goals: [],
  badges: [],
});

export function lowMoodStreak(moods: MoodEntry[]) {
  const sorted = [...moods].sort((a, b) => b.date.localeCompare(a.date));
  let n = 0;
  for (const m of sorted) {
    if (m.mood <= 2) n++;
    else break;
  }
  return n;
}

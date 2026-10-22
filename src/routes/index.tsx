import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  emptyState,
  levelInfo,
  lowMoodStreak,
  nextStreak,
  todayKey,
  XP,
  type State,
} from "@/lib/levelup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LevelUp — Gamified Life Companion" },
      { name: "description", content: "Earn XP, keep streaks and level up with daily mood check-ins and goals." },
      { property: "og:title", content: "LevelUp — Gamified Life Companion" },
      { property: "og:description", content: "Level up your real life, one small win a day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const KEY = "levelup-demo-v1";
const MOODS = [
  { v: 1, e: "😞", l: "Rough" },
  { v: 2, e: "😕", l: "Meh" },
  { v: 3, e: "😐", l: "Okay" },
  { v: 4, e: "🙂", l: "Good" },
  { v: 5, e: "🤩", l: "Great" },
];
const INTERESTS = ["Tech", "Design", "Business", "Health", "Media"];
const AGES = ["16–18", "19–21", "22–25"];

function Index() {
  const [state, setState] = useState<State | null>(null);
  const [ready, setReady] = useState(false);
  const [celebrate, setCelebrate] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setState(JSON.parse(raw));
    setReady(true);
  }, []);
  useEffect(() => {
    if (state) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  if (!ready) return null;
  if (!state) return <Onboarding onDone={(n, i) => setState(emptyState(n, i))} />;

  const award = (s: State, amount: number): State => {
    const before = levelInfo(s.xp).level;
    const xp = s.xp + amount;
    const after = levelInfo(xp).level;
    if (after > before) setCelebrate(`Level ${after} unlocked!`);
    return { ...s, xp, streak: nextStreak(s.streak, s.lastActive), lastActive: todayKey() };
  };

  return (
    <>
      <Dashboard
        state={state}
        setState={setState}
        award={award}
        onBadge={(b) => setCelebrate(`Badge earned: ${b}`)}
        onReset={() => {
          localStorage.removeItem(KEY);
          setState(null);
        }}
      />
      {celebrate && (
        <button
          onClick={() => setCelebrate(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          aria-label="Dismiss celebration"
        >
          <div className="card-lu animate-pop shadow-glow text-center px-10 py-8">
            <div className="text-5xl">🎉</div>
            <p className="mt-3 font-display text-2xl font-bold text-brand">{celebrate}</p>
            <p className="mt-2 text-sm text-muted-foreground">Tap anywhere to continue</p>
          </div>
        </button>
      )}
    </>
  );
}

function Onboarding({ onDone }: { onDone: (name: string, interests: string[]) => void }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(AGES[0]);
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold">Demo · saved on this device</span>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight">
        Level up your <span className="text-brand">real life</span>.
      </h1>
      <p className="mt-2 text-muted-foreground">One small win a day.</p>
      <form
        className="card-lu mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onDone(name.trim(), picked);
        }}
      >
        <label className="block">
          <span className="text-sm font-semibold">What should we call you?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border bg-input/40 px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <div>
          <span className="text-sm font-semibold">Age range</span>
          <div className="mt-2 flex gap-2">
            {AGES.map((a) => (
              <Chip key={a} on={age === a} onClick={() => setAge(a)}>{a}</Chip>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold">Interests</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <Chip
                key={i}
                on={picked.includes(i)}
                onClick={() => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))}
              >
                {i}
              </Chip>
            ))}
          </div>
        </div>
        <button
          disabled={!name.trim()}
          className="w-full rounded-xl bg-brand py-3 font-bold text-primary-foreground shadow-glow transition disabled:opacity-40"
        >
          Start my journey
        </button>
      </form>
    </main>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        on ? "border-primary bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Dashboard({
  state,
  setState,
  award,
  onBadge,
  onReset,
}: {
  state: State;
  setState: (s: State) => void;
  award: (s: State, n: number) => State;
  onBadge: (b: string) => void;
  onReset: () => void;
}) {
  const today = todayKey();
  const { level, into, needed } = levelInfo(state.xp);
  const mood = state.moods.find((m) => m.date === today);
  const goals = state.goals.filter((g) => g.date === today);
  const [note, setNote] = useState(mood?.note ?? "");
  const [title, setTitle] = useState("");
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const checkIn = (v: number) => {
    const others = state.moods.filter((m) => m.date !== today);
    let next: State = { ...state, moods: [...others, { date: today, mood: v, note }] };
    if (!mood) {
      next = award(next, XP.mood);
      if (!next.badges.includes("First Step")) {
        next = { ...next, badges: [...next.badges, "First Step"] };
        onBadge("First Step");
      }
    }
    setState(next);
  };

  const toggleGoal = (id: string) => {
    const g = state.goals.find((x) => x.id === id)!;
    let next: State = { ...state, goals: state.goals.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) };
    if (!g.done) next = award(next, XP.goal);
    else next = { ...next, xp: Math.max(0, next.xp - XP.goal) };
    setState(next);
  };

  const tomorrow = (id: string) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setState({ ...state, goals: state.goals.map((x) => (x.id === id ? { ...x, date: todayKey(d) } : x)) });
  };

  const nextBadge =
    !state.badges.includes("First Step")
      ? { name: "First Step", hint: "Do your first mood check-in", p: 0 }
      : { name: "7-Day Streak", hint: `${Math.max(0, 7 - state.streak)} more days to go`, p: Math.min(1, state.streak / 7) };

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-xl font-extrabold text-brand">LevelUp</span>
        <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground">
          Reset demo
        </button>
      </header>

      <section className="card-lu mt-6 bg-brand shadow-glow text-primary-foreground">
        <p className="text-sm opacity-90">{greet},</p>
        <h1 className="text-3xl font-extrabold">{state.name} 👋</h1>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm font-semibold">
              <span>Level {level}</span>
              <span>{into} / {needed} XP</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-background/30">
              <div className="h-full rounded-full bg-primary-foreground transition-all duration-500" style={{ width: `${(into / needed) * 100}%` }} />
            </div>
          </div>
          <div className="rounded-2xl bg-background/25 px-4 py-2 text-center">
            <div className="text-2xl font-extrabold">🔥 {state.streak}</div>
            <div className="text-xs">day streak</div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card-lu">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">How are you feeling?</h2>
            <span className="text-xs font-semibold text-sky">+{XP.mood} XP</span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.v}
                onClick={() => checkIn(m.v)}
                aria-label={m.l}
                className={`rounded-xl border py-3 transition hover:border-primary ${mood?.mood === m.v ? "border-primary bg-accent" : "bg-secondary"}`}
              >
                <div className="text-2xl">{m.e}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{m.l}</div>
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => mood && setState({ ...state, moods: state.moods.map((m) => (m.date === today ? { ...m, note } : m)) })}
            placeholder="One line about today (optional)"
            className="mt-3 w-full rounded-xl border bg-input/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {mood && <p className="mt-2 text-xs text-muted-foreground">Checked in ✓ — you can change it until midnight.</p>}
          {lowMoodStreak(state.moods) >= 3 && (
            <p className="mt-3 rounded-xl bg-accent p-3 text-sm">
              It's been a tough few days 💜 Talking to someone you trust, or a professional, can really help.
            </p>
          )}
        </section>

        <section className="card-lu">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Today's goals</h2>
            <span className="text-xs font-semibold text-sky">+{XP.goal} XP each</span>
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              setState({ ...state, goals: [...state.goals, { id: crypto.randomUUID(), date: today, title: title.trim(), done: false }] });
              setTitle("");
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a goal…"
              className="flex-1 rounded-xl border bg-input/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="rounded-xl bg-primary px-4 font-bold text-primary-foreground" aria-label="Add goal">+</button>
          </form>
          <ul className="mt-3 space-y-2">
            {goals.length === 0 && <li className="text-sm text-muted-foreground">No goals yet. Start small!</li>}
            {goals.map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
                <button
                  onClick={() => toggleGoal(g.id)}
                  aria-label={g.done ? "Mark not done" : "Mark done"}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${g.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}
                >
                  {g.done && "✓"}
                </button>
                <span className={`flex-1 text-sm ${g.done ? "text-muted-foreground line-through" : ""}`}>{g.title}</span>
                {!g.done && (
                  <button onClick={() => tomorrow(g.id)} className="text-xs text-muted-foreground hover:text-foreground">
                    Tomorrow →
                  </button>
                )}
                <button
                  onClick={() => setState({ ...state, goals: state.goals.filter((x) => x.id !== g.id) })}
                  aria-label="Delete goal"
                  className="text-muted-foreground hover:text-destructive"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-lu">
          <h2 className="text-lg font-bold">Next badge</h2>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl">🏅</div>
            <div className="flex-1">
              <p className="font-semibold">{nextBadge.name}</p>
              <p className="text-sm text-muted-foreground">{nextBadge.hint}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-pink" style={{ width: `${nextBadge.p * 100}%` }} />
              </div>
            </div>
          </div>
          {state.badges.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">Earned: {state.badges.join(", ")}</p>
          )}
        </section>

        <section className="card-lu">
          <h2 className="text-lg font-bold">Coming soon</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {["⏱️ Focus timer", "✅ Habits", "🧭 Career Compass", "💸 Money", "📊 Insights", "⚙️ Settings"].map((f) => (
              <div key={f} className="rounded-xl bg-secondary px-3 py-2.5 text-muted-foreground">{f}</div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

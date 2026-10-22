import { describe, expect, it } from "vitest";
import { levelInfo, nextStreak } from "@/lib/levelup";

describe("levels", () => {
  it("level 1 needs 100 XP to reach level 2", () => {
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
  });
  it("level 2 to 3 needs 200 more XP", () => {
    expect(levelInfo(299).level).toBe(2);
    expect(levelInfo(300).level).toBe(3);
  });
});

describe("streak", () => {
  const now = new Date(2026, 9, 22, 12);
  it("grows when active yesterday", () => expect(nextStreak(3, "2026-10-21", now)).toBe(4));
  it("stays when already active today", () => expect(nextStreak(3, "2026-10-22", now)).toBe(3));
  it("resets after a missed day", () => expect(nextStreak(3, "2026-10-19", now)).toBe(1));
});

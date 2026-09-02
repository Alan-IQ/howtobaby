// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Regression tests for the profile state machine: midnight rollover, visibility refresh, preview
 * becoming today, and honest persistence outcomes for save and removal.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calendarDate, resolveGuidanceContext } from "@howtobaby/core";

import { createChildProfileStore, type ChildProfileStore } from "@/storage/child-profile-store";
import { createProfileState } from "./profile-state";

function memoryStore(): { store: ChildProfileStore; map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    store: createChildProfileStore(() => ({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => void map.set(k, v),
      removeItem: (k) => void map.delete(k),
    })),
  };
}

describe("today rollover", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("advances today at local midnight via one timer (no polling) and recomputes the child's context", () => {
    vi.setSystemTime(new Date(2026, 8, 2, 23, 59, 30)); // Sept 2, 23:59:30 local
    const { store } = memoryStore();
    store.write({ dateOfBirth: calendarDate(2026, 5, 3) }); // turns 4 months on Sept 3
    const state = createProfileState({ store });
    const notified = vi.fn();
    state.subscribe(notified);
    const stop = state.start();

    const before = state.getSnapshot();
    expect(before.today).toEqual(calendarDate(2026, 9, 2));
    expect(resolveGuidanceContext({ profile: before.profile, today: before.today! }).actualChildContext?.domains.feeding.stage?.id).toBe("feed-00-04m");
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(29_000); // 23:59:59 — still the same day, no notification
    expect(notified).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_500); // past midnight
    expect(notified).toHaveBeenCalledTimes(1);
    const after = state.getSnapshot();
    expect(after.today).toEqual(calendarDate(2026, 9, 3));
    expect(after.profile).toBe(before.profile); // profile untouched — only the date moved
    expect(resolveGuidanceContext({ profile: after.profile, today: after.today! }).actualChildContext?.domains.feeding.stage?.id).toBe("feed-04-06m");
    // Re-armed for the next midnight, still exactly one timer.
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(24 * 3_600_000);
    expect(state.getSnapshot().today).toEqual(calendarDate(2026, 9, 4));
    expect(notified).toHaveBeenCalledTimes(2);
    stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("refreshToday (visibility/focus) picks up a date change after sleep without notifying when nothing changed", () => {
    vi.setSystemTime(new Date(2026, 8, 2, 10, 0));
    const state = createProfileState({ store: memoryStore().store });
    const notified = vi.fn();
    state.subscribe(notified);
    state.start();
    expect(state.getSnapshot().today).toEqual(calendarDate(2026, 9, 2));
    state.refreshToday();
    expect(notified).not.toHaveBeenCalled();
    // The machine slept for two days; timers never fired (fake clock jumps without running them).
    vi.setSystemTime(new Date(2026, 8, 4, 9, 0));
    state.refreshToday();
    expect(notified).toHaveBeenCalledTimes(1);
    expect(state.getSnapshot().today).toEqual(calendarDate(2026, 9, 4));
    expect(vi.getTimerCount()).toBe(1);
  });

  it("drops a preview plan date that has become today after the rollover", () => {
    vi.setSystemTime(new Date(2026, 8, 2, 23, 59, 59));
    const { store } = memoryStore();
    store.write({ dateOfBirth: calendarDate(2026, 5, 3) });
    const state = createProfileState({ store });
    state.start();
    state.setPreviewPlanDate(calendarDate(2026, 9, 3));
    expect(state.getSnapshot().previewPlanDate).toEqual(calendarDate(2026, 9, 3));
    vi.advanceTimersByTime(2_000);
    expect(state.getSnapshot().today).toEqual(calendarDate(2026, 9, 3));
    expect(state.getSnapshot().previewPlanDate).toBeUndefined();
    // A preview further ahead survives the rollover.
    state.setPreviewPlanDate(calendarDate(2026, 12, 25));
    vi.advanceTimersByTime(24 * 3_600_000);
    expect(state.getSnapshot().today).toEqual(calendarDate(2026, 9, 4));
    expect(state.getSnapshot().previewPlanDate).toEqual(calendarDate(2026, 12, 25));
  });
});

describe("persistence outcomes", () => {
  it("reports a save that did not persist and a removal the browser refused", () => {
    const { store, map } = memoryStore();
    const state = createProfileState({ store, now: () => new Date(2026, 8, 2, 12, 0) });
    state.saveProfile({ dateOfBirth: calendarDate(2026, 5, 3) });
    expect(state.getSnapshot().persistence).toBe("persisted");
    state.clearProfile();
    expect(state.getSnapshot()).toMatchObject({ profile: undefined, persistence: "unknown" });
    expect(map.size).toBe(0);

    const stubborn = createChildProfileStore(() => ({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => void map.set(k, v),
      removeItem: () => {
        throw new Error("blocked");
      },
    }));
    const stuck = createProfileState({ store: stubborn, now: () => new Date(2026, 8, 2, 12, 0) });
    stuck.saveProfile({ dateOfBirth: calendarDate(2026, 5, 3) });
    stuck.setPreviewPlanDate(calendarDate(2026, 10, 1));
    stuck.clearProfile();
    // Removed for this session (profile + preview gone) but NOT presented as permanent.
    expect(stuck.getSnapshot()).toMatchObject({ profile: undefined, previewPlanDate: undefined, persistence: "clear-failed" });
    expect(map.size).toBe(1); // the saved copy is still there and will come back on reload

    const readOnly = createChildProfileStore(() => ({ getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => undefined }));
    const session = createProfileState({ store: readOnly, now: () => new Date(2026, 8, 2, 12, 0) });
    session.saveProfile({ dateOfBirth: calendarDate(2026, 5, 3) });
    expect(state.getSnapshot().loaded).toBe(true);
    expect(session.getSnapshot()).toMatchObject({ profile: { dateOfBirth: calendarDate(2026, 5, 3) }, persistence: "unavailable" });
  });
});

// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Client child-profile state machine, framework-free so it can be tested without a DOM.
 *
 * Holds the optional profile, the persistence outcome of the LAST save/removal, a session-only
 * preview plan date and "today" — the actual local calendar date. Today is refreshed without
 * polling: one timer armed for the next local midnight (re-armed after each firing) plus a
 * refresh whenever the page becomes visible or focused again, which also catches a laptop that
 * slept through midnight or a device whose time zone changed. Every consumer derives the actual
 * child context, stages, corrected-age eligibility and safety scope from `today`, so all of them
 * recompute the moment it changes.
 */

import { isSameCalendarDate, localCalendarDate, msUntilNextLocalMidnight, type CalendarDate, type ChildProfile } from "@howtobaby/core";

import type { ChildProfileStore } from "@/storage/child-profile-store";

/**
 * Outcome of the last persistence operation:
 * - `unknown`: nothing attempted this session (a stored profile may have been read);
 * - `persisted`: the last save reached storage;
 * - `unavailable`: the last save did NOT reach storage — the profile applies to this visit only;
 * - `clear-failed`: the profile was removed for this session, but the browser refused to delete
 *   the saved copy, so it can reappear on the next load.
 */
export type ProfilePersistence = "unknown" | "persisted" | "unavailable" | "clear-failed";

export interface ProfileSnapshot {
  readonly loaded: boolean;
  readonly profile: ChildProfile | undefined;
  readonly persistence: ProfilePersistence;
  readonly previewPlanDate: CalendarDate | undefined;
  readonly today: CalendarDate | undefined;
}

export const SERVER_PROFILE_SNAPSHOT: ProfileSnapshot = { loaded: false, profile: undefined, persistence: "unknown", previewPlanDate: undefined, today: undefined };

export interface ProfileStateOptions {
  store: ChildProfileStore;
  now?: () => Date;
  setTimer?: (callback: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

export interface ProfileState {
  subscribe(listener: () => void): () => void;
  getSnapshot(): ProfileSnapshot;
  saveProfile(profile: ChildProfile): void;
  clearProfile(): void;
  setPreviewPlanDate(date: CalendarDate | undefined): void;
  /** Re-read the local calendar date; notifies only when the date actually changed. Re-arms the midnight timer. */
  refreshToday(): void;
  /** Arm the midnight rollover timer (idempotent). Returns a disposer. */
  start(): () => void;
}

export function createProfileState({ store, now = () => new Date(), setTimer = (cb, ms) => setTimeout(cb, ms), clearTimer = (h) => clearTimeout(h as ReturnType<typeof setTimeout>) }: ProfileStateOptions): ProfileState {
  const listeners = new Set<() => void>();
  let snapshot: ProfileSnapshot | undefined;
  let timer: unknown;
  let started = 0;

  function emit(next: ProfileSnapshot): void {
    snapshot = next;
    for (const listener of listeners) listener();
  }

  function getSnapshot(): ProfileSnapshot {
    snapshot ??= { loaded: true, profile: store.read(), persistence: "unknown", previewPlanDate: undefined, today: localCalendarDate(now()) };
    return snapshot;
  }

  function arm(): void {
    if (started === 0) return;
    if (timer !== undefined) clearTimer(timer);
    timer = setTimer(() => {
      timer = undefined;
      refreshToday();
    }, msUntilNextLocalMidnight(now()));
  }

  function refreshToday(): void {
    const current = getSnapshot();
    const today = localCalendarDate(now());
    if (!current.today || !isSameCalendarDate(current.today, today)) {
      // A preview that has become "today" is no preview any more: drop it rather than showing a stale banner.
      const previewPlanDate = current.previewPlanDate && isSameCalendarDate(current.previewPlanDate, today) ? undefined : current.previewPlanDate;
      emit({ ...current, today, previewPlanDate });
    }
    arm();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot,
    saveProfile(profile) {
      const persisted = store.write(profile);
      emit({ ...getSnapshot(), profile, persistence: persisted ? "persisted" : "unavailable" });
    },
    clearProfile() {
      const cleared = store.clear();
      emit({ ...getSnapshot(), profile: undefined, persistence: cleared ? "unknown" : "clear-failed", previewPlanDate: undefined });
    },
    setPreviewPlanDate(previewPlanDate) {
      emit({ ...getSnapshot(), previewPlanDate });
    },
    refreshToday,
    start() {
      started += 1;
      arm();
      return () => {
        started -= 1;
        if (started === 0 && timer !== undefined) {
          clearTimer(timer);
          timer = undefined;
        }
      };
    },
  };
}

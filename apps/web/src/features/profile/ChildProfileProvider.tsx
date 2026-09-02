// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Client-side child-profile state (PROJECT_PROFILE §6, GUIDANCE_CONTENT_CONTRACT §7).
 *
 * One module-level state (see profile-state.ts), mirrored to localStorage: the optional
 * profile, the persistence outcome, a session-only preview plan date (never stored, never in a
 * URL) and "today" — the actual local calendar date, kept current across midnight and after the
 * tab regains visibility/focus. Pages are prerendered with NO profile (public routes carry zero
 * child data); `useSyncExternalStore` serves that snapshot during SSR/hydration and swaps to
 * the stored profile right after, so a profile can never leak into prerendered HTML, metadata
 * or the route. Browsing a stage is a ROUTE, not profile state: nothing here changes when the
 * user browses.
 */

"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { resolveGuidanceContext, type CalendarDate, type ChildProfile, type GuidanceContext, type StageDefinition } from "@howtobaby/core";

import { localChildProfileStore } from "@/storage/child-profile-store";
import { createProfileState, SERVER_PROFILE_SNAPSHOT, type ProfileSnapshot } from "./profile-state";

export type { ProfilePersistence, ProfileSnapshot } from "./profile-state";

const state = createProfileState({ store: localChildProfileStore });

function getServerSnapshot(): ProfileSnapshot {
  return SERVER_PROFILE_SNAPSHOT;
}

export interface ChildProfileContextValue extends ProfileSnapshot {
  saveProfile: (profile: ChildProfile) => void;
  clearProfile: () => void;
  setPreviewPlanDate: (date: CalendarDate | undefined) => void;
}

const actions = { saveProfile: state.saveProfile, clearProfile: state.clearProfile, setPreviewPlanDate: state.setPreviewPlanDate };
const ChildProfileContext = createContext<ChildProfileContextValue>({ ...SERVER_PROFILE_SNAPSHOT, ...actions });

export function ChildProfileProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(state.subscribe, state.getSnapshot, getServerSnapshot);

  // Keep "today" current: one timer to the next local midnight, plus a refresh when the page
  // comes back (sleep, background tab, time-zone change) — no polling.
  useEffect(() => {
    const stop = state.start();
    const onVisible = () => {
      if (document.visibilityState === "visible") state.refreshToday();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", state.refreshToday);
    window.addEventListener("pageshow", state.refreshToday);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", state.refreshToday);
      window.removeEventListener("pageshow", state.refreshToday);
    };
  }, []);

  const value = useMemo<ChildProfileContextValue>(() => ({ ...snapshot, ...actions }), [snapshot]);
  return <ChildProfileContext.Provider value={value}>{children}</ChildProfileContext.Provider>;
}

export function useChildProfile(): ChildProfileContextValue {
  return useContext(ChildProfileContext);
}

/**
 * The §7 guidance context for the current view: actual child on TODAY, the browsed stage (a
 * route value), and the session preview date — three separate fields, resolved in @howtobaby/core.
 * Without a loaded client snapshot (SSR) it is the public, profile-free context.
 */
export function useGuidanceContext(browsedStage?: StageDefinition): GuidanceContext {
  const { profile, today, previewPlanDate } = useChildProfile();
  return useMemo(() => {
    if (!today) return browsedStage ? { browsedContentContext: { domain: browsedStage.domain, stage: browsedStage } } : {};
    return resolveGuidanceContext({ profile, today, browsedStage, previewPlanDate });
  }, [profile, today, previewPlanDate, browsedStage]);
}

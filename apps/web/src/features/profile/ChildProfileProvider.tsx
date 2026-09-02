// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Client-side child-profile state (PROJECT_PROFILE §6, GUIDANCE_CONTENT_CONTRACT §7).
 *
 * One module-level external store, mirrored to localStorage: the optional profile, whether the
 * last save actually persisted, a session-only preview plan date (never stored, never in a URL)
 * and "today" — the actual local calendar date, resolved on the client. Pages are prerendered
 * with NO profile (public routes carry zero child data); `useSyncExternalStore` serves that
 * snapshot during SSR/hydration and swaps to the stored profile right after, so a profile can
 * never leak into prerendered HTML, metadata or the route.
 *
 * Browsing a stage is a ROUTE, not profile state: nothing here changes when the user browses.
 */

"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { localCalendarDate, resolveGuidanceContext, type CalendarDate, type ChildProfile, type GuidanceContext, type StageDefinition } from "@howtobaby/core";

import { localChildProfileStore } from "@/storage/child-profile-store";

export type ProfilePersistence = "unknown" | "persisted" | "unavailable";

interface ProfileSnapshot {
  readonly loaded: boolean;
  readonly profile: ChildProfile | undefined;
  readonly persistence: ProfilePersistence;
  readonly previewPlanDate: CalendarDate | undefined;
  readonly today: CalendarDate | undefined;
}

const SERVER_SNAPSHOT: ProfileSnapshot = { loaded: false, profile: undefined, persistence: "unknown", previewPlanDate: undefined, today: undefined };

const listeners = new Set<() => void>();
let snapshot: ProfileSnapshot | undefined;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(next: ProfileSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

function getSnapshot(): ProfileSnapshot {
  snapshot ??= { loaded: true, profile: localChildProfileStore.read(), persistence: "unknown", previewPlanDate: undefined, today: localCalendarDate(new Date()) };
  return snapshot;
}

function getServerSnapshot(): ProfileSnapshot {
  return SERVER_SNAPSHOT;
}

function saveProfile(profile: ChildProfile): void {
  const persisted = localChildProfileStore.write(profile);
  emit({ ...getSnapshot(), profile, persistence: persisted ? "persisted" : "unavailable" });
}

function clearProfile(): void {
  localChildProfileStore.clear();
  emit({ ...getSnapshot(), profile: undefined, persistence: "unknown", previewPlanDate: undefined });
}

function setPreviewPlanDate(previewPlanDate: CalendarDate | undefined): void {
  emit({ ...getSnapshot(), previewPlanDate });
}

/** Test/dev hook: forget the in-memory snapshot so the next read goes back to storage. */
export function resetChildProfileSnapshotForTests(): void {
  snapshot = undefined;
}

export interface ChildProfileContextValue extends ProfileSnapshot {
  saveProfile: (profile: ChildProfile) => void;
  clearProfile: () => void;
  setPreviewPlanDate: (date: CalendarDate | undefined) => void;
}

const ChildProfileContext = createContext<ChildProfileContextValue>({ ...SERVER_SNAPSHOT, saveProfile, clearProfile, setPreviewPlanDate });

export function ChildProfileProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo<ChildProfileContextValue>(() => ({ ...state, saveProfile, clearProfile, setPreviewPlanDate }), [state]);
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

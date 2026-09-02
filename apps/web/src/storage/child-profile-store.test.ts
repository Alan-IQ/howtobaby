// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { calendarDate } from "@howtobaby/core";

import { CHILD_PROFILE_STORAGE_KEY, createChildProfileStore, parseChildProfile, serializeChildProfile, validateChildProfileInput } from "./child-profile-store";

const today = calendarDate(2026, 9, 2);

describe("validateChildProfileInput", () => {
  it("requires a calendar-valid, non-future date of birth", () => {
    expect(validateChildProfileInput({ dateOfBirth: "" }, today).issues).toEqual(["dob-required"]);
    expect(validateChildProfileInput({ dateOfBirth: "2025-02-29" }, today).issues).toEqual(["dob-invalid"]);
    expect(validateChildProfileInput({ dateOfBirth: "2026-09-03" }, today).issues).toEqual(["dob-future"]);
    expect(validateChildProfileInput({ dateOfBirth: "2026-09-02" }, today)).toEqual({ issues: [], profile: { dateOfBirth: today } });
  });

  it("keeps the due date and name optional and drops empty strings", () => {
    const result = validateChildProfileInput({ dateOfBirth: "2026-03-01", estimatedDueDate: "  ", displayName: " " }, today);
    expect(result.profile).toEqual({ dateOfBirth: calendarDate(2026, 3, 1) });
    const full = validateChildProfileInput({ dateOfBirth: "2026-03-01", estimatedDueDate: "2026-04-10", displayName: " An " }, today);
    expect(full.profile).toEqual({ dateOfBirth: calendarDate(2026, 3, 1), estimatedDueDate: calendarDate(2026, 4, 10), displayName: "An" });
  });

  it("reports every issue at once", () => {
    const result = validateChildProfileInput({ dateOfBirth: "2026-13-01", estimatedDueDate: "nope", displayName: "x".repeat(41) }, today);
    expect(result.issues).toEqual(["dob-invalid", "edd-invalid", "name-too-long"]);
    expect(result.profile).toBeUndefined();
  });
});

describe("serialize / parse", () => {
  it("round-trips a full profile as plain ISO dates", () => {
    const profile = { dateOfBirth: calendarDate(2024, 2, 29), estimatedDueDate: calendarDate(2024, 3, 20), displayName: "Bé" };
    const text = serializeChildProfile(profile);
    expect(JSON.parse(text)).toEqual({ dateOfBirth: "2024-02-29", estimatedDueDate: "2024-03-20", displayName: "Bé" });
    expect(parseChildProfile(text)).toEqual(profile);
  });

  it("rejects malformed or partial stored values entirely", () => {
    expect(parseChildProfile(null)).toBeUndefined();
    expect(parseChildProfile("not json")).toBeUndefined();
    expect(parseChildProfile("[]")).toBeUndefined();
    expect(parseChildProfile(JSON.stringify({ displayName: "x" }))).toBeUndefined();
    expect(parseChildProfile(JSON.stringify({ dateOfBirth: "2025-02-30" }))).toBeUndefined();
    expect(parseChildProfile(JSON.stringify({ dateOfBirth: "2025-02-01", estimatedDueDate: "bad" }))).toBeUndefined();
    expect(parseChildProfile(JSON.stringify({ dateOfBirth: "2025-02-01", displayName: 5 }))).toBeUndefined();
    expect(parseChildProfile(JSON.stringify({ dateOfBirth: "2025-02-01" }))).toEqual({ dateOfBirth: calendarDate(2025, 2, 1) });
  });
});

describe("createChildProfileStore", () => {
  const profile = { dateOfBirth: calendarDate(2026, 1, 15) };

  it("reads, writes and clears through the storage key", () => {
    const map = new Map<string, string>();
    const store = createChildProfileStore(() => ({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => void map.set(k, v),
      removeItem: (k) => void map.delete(k),
    }));
    expect(store.read()).toBeUndefined();
    expect(store.write(profile)).toBe(true);
    expect(map.has(CHILD_PROFILE_STORAGE_KEY)).toBe(true);
    expect(store.read()).toEqual(profile);
    store.clear();
    expect(store.read()).toBeUndefined();
  });

  it("reports persistence as unavailable when storage is missing or throws, without throwing itself", () => {
    expect(createChildProfileStore(() => undefined).write(profile)).toBe(false);
    const throwing = createChildProfileStore(() => ({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    }));
    expect(throwing.read()).toBeUndefined();
    expect(throwing.write(profile)).toBe(false);
    expect(() => throwing.clear()).not.toThrow();
  });
});

// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Local persistence of the OPTIONAL child profile (PROJECT_PROFILE §6, SYSTEM_ARCHITECTURE §10):
 * date of birth (required), estimated due date and display name (optional). localStorage only —
 * the profile is never sent to a server, placed in a URL, metadata, analytics or logs. Name is
 * display-only; dates resolve context locally through @howtobaby/core and never create a
 * diagnosis. If persistence fails, the in-memory profile still works for the session and the
 * caller can tell the user persistence is unavailable (`write` returns `false`); likewise a
 * removal that the browser refuses is reported (`clear` returns `false`), never hidden.
 */

import { compareCalendarDates, formatCalendarDate, isValidCalendarDate, parseCalendarDate, type CalendarDate, type ChildProfile } from "@howtobaby/core";

export const CHILD_PROFILE_STORAGE_KEY = "htb.child-profile.v1";
export const DISPLAY_NAME_MAX_LENGTH = 40;

export interface ChildProfileStore {
  read(): ChildProfile | undefined;
  /** Returns whether the profile was actually persisted. */
  write(profile: ChildProfile): boolean;
  /**
   * Returns whether no persisted copy remains afterwards. `false` means the browser refused the
   * removal (or still returns the value) — a stored profile can reappear on the next load, so the
   * caller must not present the removal as permanent.
   */
  clear(): boolean;
}

export type ChildProfileIssue = "dob-required" | "dob-invalid" | "dob-future" | "edd-invalid" | "name-too-long";

export interface ChildProfileInput {
  dateOfBirth: string;
  estimatedDueDate?: string;
  displayName?: string;
}

export interface ChildProfileValidation {
  profile?: ChildProfile;
  issues: ChildProfileIssue[];
}

/** Validate raw form input into a profile. Empty optional fields are dropped, never stored as "". */
export function validateChildProfileInput(input: ChildProfileInput, today: CalendarDate): ChildProfileValidation {
  const issues: ChildProfileIssue[] = [];
  const dobText = input.dateOfBirth.trim();
  const dateOfBirth = parseCalendarDate(dobText);
  if (dobText === "") issues.push("dob-required");
  else if (!dateOfBirth) issues.push("dob-invalid");
  else if (compareCalendarDates(dateOfBirth, today) > 0) issues.push("dob-future");

  const eddText = input.estimatedDueDate?.trim() ?? "";
  const estimatedDueDate = eddText === "" ? undefined : parseCalendarDate(eddText);
  if (eddText !== "" && !estimatedDueDate) issues.push("edd-invalid");

  const displayName = input.displayName?.trim() ?? "";
  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) issues.push("name-too-long");

  if (issues.length > 0 || !dateOfBirth) return { issues };
  return {
    issues,
    profile: {
      dateOfBirth,
      ...(estimatedDueDate ? { estimatedDueDate } : {}),
      ...(displayName !== "" ? { displayName } : {}),
    },
  };
}

/** Parse a stored JSON value; anything malformed yields `undefined` (never a partial profile). */
export function parseChildProfile(value: string | null | undefined): ChildProfile | undefined {
  if (!value) return undefined;
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    return undefined;
  }
  if (typeof raw !== "object" || raw === null) return undefined;
  const record = raw as Record<string, unknown>;
  const dateOfBirth = parseCalendarDate(record["dateOfBirth"]);
  if (!dateOfBirth) return undefined;
  const profile: { -readonly [K in keyof ChildProfile]: ChildProfile[K] } = { dateOfBirth };
  if (record["estimatedDueDate"] !== undefined) {
    const estimatedDueDate = parseCalendarDate(record["estimatedDueDate"]);
    if (!estimatedDueDate) return undefined;
    profile.estimatedDueDate = estimatedDueDate;
  }
  if (record["displayName"] !== undefined) {
    const name = record["displayName"];
    if (typeof name !== "string" || name.trim() === "" || name.length > DISPLAY_NAME_MAX_LENGTH) return undefined;
    profile.displayName = name;
  }
  return profile;
}

export function serializeChildProfile(profile: ChildProfile): string {
  if (!isValidCalendarDate(profile.dateOfBirth)) throw new RangeError("Invalid date of birth");
  return JSON.stringify({
    dateOfBirth: formatCalendarDate(profile.dateOfBirth),
    ...(profile.estimatedDueDate ? { estimatedDueDate: formatCalendarDate(profile.estimatedDueDate) } : {}),
    ...(profile.displayName ? { displayName: profile.displayName } : {}),
  });
}

export function createChildProfileStore(storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem"> | undefined, key = CHILD_PROFILE_STORAGE_KEY): ChildProfileStore {
  return {
    read(): ChildProfile | undefined {
      try {
        return parseChildProfile(storage()?.getItem(key));
      } catch {
        return undefined;
      }
    },
    write(profile: ChildProfile): boolean {
      try {
        const target = storage();
        if (!target) return false;
        target.setItem(key, serializeChildProfile(profile));
        return true;
      } catch {
        return false;
      }
    },
    clear(): boolean {
      try {
        const target = storage();
        if (!target) return true; // nothing could have been persisted
        target.removeItem(key);
        return target.getItem(key) === null;
      } catch {
        return false;
      }
    },
  };
}

/** Browser store; safe to construct during SSR (storage is resolved lazily). */
export const localChildProfileStore = createChildProfileStore(() => (typeof window === "undefined" ? undefined : window.localStorage));

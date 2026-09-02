// SPDX-License-Identifier: AGPL-3.0-only
/**
 * ProfileEditor (docs/GUI_DESIGN.md §17): the optional local child profile — DOB required, due
 * date and display name optional. The form never submits anywhere: values validate through
 * @howtobaby/core dates, save to localStorage only, and never touch the URL.
 */

"use client";

import { useState, type FormEvent } from "react";

import { formatCalendarDate } from "@howtobaby/core";
import { Button, Card, Input } from "@howtobaby/ui";

import { formatDate } from "@/features/evidence/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMessages } from "@/i18n/T";
import { validateChildProfileInput, type ChildProfileIssue } from "@/storage/child-profile-store";
import { useChildProfile } from "./ChildProfileProvider";

export function ProfileEditor() {
  const t = useMessages();
  const { language } = useLanguage();
  const { loaded, profile, today, saveProfile, clearProfile, persistence } = useChildProfile();
  const [editing, setEditing] = useState(false);
  const [issues, setIssues] = useState<ChildProfileIssue[]>([]);
  const showForm = loaded && (editing || !profile);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!today) return;
    const data = new FormData(event.currentTarget);
    const result = validateChildProfileInput(
      {
        dateOfBirth: String(data.get("dateOfBirth") ?? ""),
        estimatedDueDate: String(data.get("estimatedDueDate") ?? ""),
        displayName: String(data.get("displayName") ?? ""),
      },
      today,
    );
    setIssues(result.issues);
    if (result.profile) {
      saveProfile(result.profile);
      setEditing(false);
    }
  }

  return (
    <Card icon="calendar" accent="brand" title={t("profile.title")} titleAs="h2" className="profile-editor">
      <p className="muted">{t("profile.lede")}</p>
      {showForm ? (
        // No `action`/`method`: the form is handled locally and never becomes a query string.
        <form className="profile-editor__form" onSubmit={onSubmit} noValidate>
          <Input label={t("profile.dob.label")} name="dateOfBirth" type="date" required defaultValue={profile ? formatCalendarDate(profile.dateOfBirth) : ""} autoComplete="off" />
          <Input
            label={t("profile.edd.label")}
            name="estimatedDueDate"
            type="date"
            hint={t("profile.edd.hint")}
            defaultValue={profile?.estimatedDueDate ? formatCalendarDate(profile.estimatedDueDate) : ""}
            autoComplete="off"
          />
          <Input label={t("profile.name.label")} name="displayName" type="text" maxLength={40} defaultValue={profile?.displayName ?? ""} autoComplete="off" />
          {issues.length > 0 ? (
            <ul className="profile-editor__errors" role="alert">
              {issues.map((issue) => (
                <li key={issue}>{t(`profile.error.${issue}`)}</li>
              ))}
            </ul>
          ) : null}
          <div className="profile-editor__actions">
            <Button type="submit" variant="primary">
              {t("profile.save")}
            </Button>
            {profile ? (
              <Button variant="subtle" onClick={() => setEditing(false)}>
                {t("profile.cancel")}
              </Button>
            ) : null}
          </div>
        </form>
      ) : loaded && profile ? (
        <>
          <dl className="child-summary__facts">
            <div>
              <dt>{t("profile.saved.dob")}</dt>
              <dd>{formatDate(formatCalendarDate(profile.dateOfBirth), language)}</dd>
            </div>
            {profile.estimatedDueDate ? (
              <div>
                <dt>{t("profile.saved.edd")}</dt>
                <dd>{formatDate(formatCalendarDate(profile.estimatedDueDate), language)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="profile-editor__actions">
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              {t("profile.edit")}
            </Button>
            <Button variant="subtle" size="sm" onClick={clearProfile}>
              {t("profile.remove")}
            </Button>
          </div>
        </>
      ) : (
        <p className="muted">{t("profile.empty")}</p>
      )}
      {persistence === "unavailable" ? (
        <p className="muted profile-editor__warning" role="status">
          {t("profile.persistence.unavailable")}
        </p>
      ) : null}
      {persistence === "clear-failed" ? (
        <p className="muted profile-editor__warning" role="status">
          {t("profile.persistence.clearFailed")}
        </p>
      ) : null}
    </Card>
  );
}

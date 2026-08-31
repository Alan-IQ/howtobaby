// SPDX-License-Identifier: AGPL-3.0-only
// KnowledgeRepository read-model boundary. This entry stays free of node:sqlite so app builds
// only load the JSON-backed repository; scripts/tests import the SQLite one from
// `@howtobaby/knowledge/repository/sqlite` explicitly.
export * from "./types.ts";
export * from "./generated.ts";

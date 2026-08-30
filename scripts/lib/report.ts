// SPDX-License-Identifier: AGPL-3.0-only
// Shared console / GitHub Actions reporting for baseline scripts.

import { appendFileSync } from "node:fs";

export type Severity = "error" | "warning" | "info";

export interface Finding {
  severity: Severity;
  check: string;
  message: string;
  path?: string;
}

export class Report {
  readonly findings: Finding[] = [];
  readonly title: string;
  private readonly lines: string[] = [];

  constructor(title: string) {
    this.title = title;
    this.lines.push(`# ${title}`, "");
  }

  section(heading: string): void {
    this.lines.push("", `## ${heading}`, "");
  }

  line(text = ""): void {
    this.lines.push(text);
  }

  table(headers: string[], rows: string[][]): void {
    if (rows.length === 0) {
      this.lines.push("_none_");
      return;
    }
    this.lines.push(`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`);
    for (const row of rows) this.lines.push(`| ${row.map((c) => c.replace(/\|/g, "\\|")).join(" | ")} |`);
  }

  add(finding: Finding): void {
    this.findings.push(finding);
    const tag = finding.severity === "error" ? "FAIL" : finding.severity === "warning" ? "WARN" : "INFO";
    this.lines.push(`- **${tag}** [${finding.check}] ${finding.path ? `\`${finding.path}\` — ` : ""}${finding.message}`);
    if (process.env.GITHUB_ACTIONS === "true" && finding.severity !== "info") {
      const loc = finding.path ? ` file=${finding.path}` : "";
      console.log(`::${finding.severity}${loc ? `${loc},` : " "}title=${finding.check}::${finding.message}`);
    }
  }

  error(check: string, message: string, path?: string): void {
    this.add(path === undefined ? { severity: "error", check, message } : { severity: "error", check, message, path });
  }

  warn(check: string, message: string, path?: string): void {
    this.add(path === undefined ? { severity: "warning", check, message } : { severity: "warning", check, message, path });
  }

  info(check: string, message: string, path?: string): void {
    this.add(path === undefined ? { severity: "info", check, message } : { severity: "info", check, message, path });
  }

  get errors(): Finding[] {
    return this.findings.filter((f) => f.severity === "error");
  }

  get warnings(): Finding[] {
    return this.findings.filter((f) => f.severity === "warning");
  }

  finish(): number {
    const status = this.errors.length > 0 ? "FAILED" : this.warnings.length > 0 ? "PASSED WITH WARNINGS" : "PASSED";
    this.lines.push("", `**Result: ${status}** — ${this.errors.length} error(s), ${this.warnings.length} warning(s).`);
    const markdown = `${this.lines.join("\n")}\n`;
    process.stdout.write(markdown);
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath) appendFileSync(summaryPath, markdown);
    return this.errors.length > 0 ? 1 : 0;
  }

  toJSON(): { title: string; findings: Finding[]; markdown: string } {
    return { title: this.title, findings: this.findings, markdown: `${this.lines.join("\n")}\n` };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KiB", "MiB", "GiB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[unit]}`;
}

export const MiB = 1024 * 1024;

export function parseArgs(argv: string[]): { flags: Set<string>; values: Map<string, string> } {
  const flags = new Set<string>();
  const values = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq > 0) values.set(arg.slice(2, eq), arg.slice(eq + 1));
    else flags.add(arg.slice(2));
  }
  return { flags, values };
}

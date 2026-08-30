// SPDX-License-Identifier: AGPL-3.0-only
// Tiny gitignore-style glob matcher: supports `**`, `*`, `?`, and `{a,b}` alternatives.

export function globToRegExp(pattern: string): RegExp {
  let re = "^";
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i]!;
    if (ch === "*") {
      if (pattern[i + 1] === "*") {
        // "**/" matches zero or more directories; trailing "**" matches everything.
        if (pattern[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 3;
        } else {
          re += ".*";
          i += 2;
        }
      } else {
        re += "[^/]*";
        i += 1;
      }
    } else if (ch === "?") {
      re += "[^/]";
      i += 1;
    } else if (ch === "{") {
      const end = pattern.indexOf("}", i);
      if (end < 0) throw new Error(`Unclosed brace in pattern: ${pattern}`);
      const alternatives = pattern.slice(i + 1, end).split(",").map(escape);
      re += `(?:${alternatives.join("|")})`;
      i = end + 1;
    } else {
      re += escape(ch);
      i += 1;
    }
  }
  return new RegExp(`${re}$`);
}

function escape(s: string): string {
  return s.replace(/[.+^$()|[\]\\]/g, "\\$&");
}

export function matchesAny(path: string, patterns: readonly string[]): string | undefined {
  for (const p of patterns) {
    if (globToRegExp(p).test(path)) return p;
  }
  return undefined;
}

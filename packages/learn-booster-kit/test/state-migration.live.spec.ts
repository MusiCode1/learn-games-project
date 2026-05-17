import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { runStateMigrations } from "../src/lib/config/migrations";

const LIVE = path.resolve(
  __dirname,
  "../../../docs/private-docs/live-snapshots/profiles-state-baseline.json",
);

describe("Live snapshot migration (local only)", () => {
  const run = fs.existsSync(LIVE) ? it : it.skip;
  run("baseline → migrates to latest shape", () => {
    const input = JSON.parse(fs.readFileSync(LIVE, "utf8"));
    const out = runStateMigrations(input);
    expect(out.schemaVersion).toBe(2);
    expect(typeof out.profiles).toBe("object");
    // לכל פרופיל: יש boosterConfig עם schemaVersion, אין config
    for (const p of Object.values(out.profiles) as any[]) {
      expect(p.boosterConfig).toBeDefined();
      expect(typeof p.boosterConfig.schemaVersion).toBe("number");
      expect(p.config).toBeUndefined();
      if (p.gameSettings) {
        for (const entry of Object.values(p.gameSettings) as any[]) {
          expect(typeof entry.schemaVersion).toBe("number");
          expect(entry.data).toBeDefined();
        }
      }
    }
    expect(out.dirtyConfig).toBeUndefined();
  });
});

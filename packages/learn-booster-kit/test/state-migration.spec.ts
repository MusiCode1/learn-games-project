import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { runStateMigrations } from "../src/lib/config/migrations";

const FIXTURES = path.resolve(__dirname, "fixtures/profiles-state");

describe("ProfilesState migrations — fixtures", () => {
  it("v01 → migrated == v01.expected", () => {
    const input = JSON.parse(fs.readFileSync(path.join(FIXTURES, "v01.json"), "utf8"));
    const expected = JSON.parse(fs.readFileSync(path.join(FIXTURES, "v01.expected.json"), "utf8"));
    const actual = runStateMigrations(input);
    expect(actual).toEqual(expected);
  });

  it("does not mutate input", () => {
    const input = JSON.parse(fs.readFileSync(path.join(FIXTURES, "v01.json"), "utf8"));
    const snapshot = JSON.parse(JSON.stringify(input));
    runStateMigrations(input);
    expect(input).toEqual(snapshot);
  });
});

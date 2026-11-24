import { describe, expect, it } from "vitest";
import { readingTime } from "@/utils/readingTime";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("readingTime", () => {
  it("is at least one minute", () => {
    expect(readingTime()).toBe(1);
    expect(readingTime("")).toBe(1);
  });

  it("rounds up at 200 words a minute", () => {
    expect(readingTime(words(200))).toBe(1);
    expect(readingTime(words(201))).toBe(2);
  });

  it("skips MDX import and export lines outside code fences", () => {
    const esm = Array.from(
      { length: 300 },
      (_, i) => `import X${i} from "./x";`
    ).join("\n");
    expect(readingTime(`${esm}\n${words(10)}`)).toBe(1);
  });

  it("counts import lines inside code fences", () => {
    const code = Array.from({ length: 250 }, () => 'import x from "y";').join(
      "\n"
    );
    expect(readingTime("```ts\n" + code + "\n```")).toBeGreaterThan(1);
  });
});

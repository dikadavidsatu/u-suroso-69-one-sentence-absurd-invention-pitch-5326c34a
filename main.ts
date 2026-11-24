import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one sentence pitching a ridiculous invention that fixes a
// tiny everyday annoyance — a dying phone and the anxious pacing it causes.
const PITCH =
  "Meet Pocket Hamster, a treadmill charger in your pocket that only powers your dying phone while you pace anxiously, turning every 1% panic into honest electricity.";

const MAX_CHARS = 220;

function checkPitch(text: string): string[] {
  const problems: string[] = [];
  if (text.length === 0) {
    problems.push("pitch is empty");
  }
  if (text.trim().length === 0) {
    problems.push("pitch is only whitespace");
  }
  if (text.length > MAX_CHARS) {
    problems.push(`pitch is ${text.length} characters, over the ${MAX_CHARS} limit`);
  }
  const ends = text.match(/[.!?]/g) ?? [];
  if (ends.length !== 1 || !text.endsWith(".")) {
    problems.push(`pitch must be exactly one sentence ending in a period (found ${ends.length} sentence-ending marks)`);
  }
  if (/[\r\n]/.test(text)) {
    problems.push("pitch must be a single line");
  }
  return problems;
}

const problems = checkPitch(PITCH);
if (problems.length > 0) {
  throw new Error(`invalid pitch: ${problems.join("; ")}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "entry.txt");
writeFileSync(outFile, PITCH, "utf8");

// Read back what was written and confirm it is byte-identical to the pitch,
// so a partial or mangled write is caught instead of silently graded.
const written = readFileSync(outFile, "utf8");
if (written !== PITCH) {
  throw new Error("written entry.txt does not match the pitch");
}
console.log(`wrote ${PITCH.length} characters to ${outFile}`);

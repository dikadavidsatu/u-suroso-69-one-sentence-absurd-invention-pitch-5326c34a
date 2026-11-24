// One-Sentence Absurd Invention Pitch — make.fun entry
//
// The program writes exactly one sentence to `$MAKEFUN_OUTPUT_DIR/entry.txt`
// (default `/output/entry.txt`, the path the grader reads). The sentence
// pitches a ridiculous invention that fixes a tiny everyday annoyance, and
// it is checked against the competition's gate BEFORE anything is written:
//
//   * UTF-8 text, 1 to 220 characters, not only white space
//   * exactly one sentence, ending in a period, on a single line
//
// The entry is fully deterministic: the pitch is a constant baked into this
// file, no network, no randomness, no clock, no reading of anything outside
// the repository. Running it twice produces byte-identical output.
//
// The pitch itself — "The Confessional Dryer" — takes the oldest laundry
// mystery there is (the sock that vanishes in the wash) and answers it with
// a machine that treats the disappearance as a matter for confession: the
// dryer gives each sock back one at a time, and every returned sock arrives
// clutching a tiny handwritten apology note that explains where its partner
// went. The joke lives in the invention, not in a punchline bolted on at
// the end: a household appliance running a lost-and-found with paperwork.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The pitch
// ---------------------------------------------------------------------------

// One sentence, one invention, one tiny annoyance: the sock the dryer eats.
const PITCH =
  "Meet the Confessional Dryer, a tumble dryer that returns your lost socks one at a time, each clutching a tiny handwritten apology note explaining where its partner went and why it eloped with the lint.";

// ---------------------------------------------------------------------------
// The gate (competition.yaml: /output/entry.txt must be UTF-8 text of
// 1 to 220 characters, not only white space)
// ---------------------------------------------------------------------------

const MIN_CHARS = 1;
const MAX_CHARS = 220;

// Count characters the way a reader counts them: one per Unicode code
// point, so an emoji or an accented letter is one character, not two
// UTF-16 code units. For this ASCII-only pitch both counts agree, and the
// validator checks both so the gate holds under either reading.
function countChars(text: string): number {
  return [...text].length;
}

// How many sentence-ending marks (`.`, `!`, `?`) the text carries. A pitch
// is one sentence, so this must come out as exactly one.
function countSentenceEndings(text: string): number {
  return (text.match(/[.!?]/g) ?? []).length;
}

// Split on runs of whitespace and drop the empties: the word count of the
// pitch, used for the sanity check that the sentence actually says
// something (annoyance + invention + mechanism) instead of gaming the
// character gate with a stub.
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Every structural rule the gate implies, plus the ones that keep the
// sentence a single clean pitch. Returns the list of violations; an empty
// list means the pitch is safe to write.
function validatePitch(text: string): string[] {
  const problems: string[] = [];

  if (text.length === 0) {
    problems.push("pitch is empty");
  }
  if (text.trim().length === 0) {
    problems.push("pitch is only whitespace");
  }

  const chars = countChars(text);
  if (chars < MIN_CHARS) {
    problems.push(`pitch is ${chars} characters, below the ${MIN_CHARS} minimum`);
  }
  if (chars > MAX_CHARS) {
    problems.push(`pitch is ${chars} characters, over the ${MAX_CHARS} limit`);
  }
  // The UTF-16 length is what a naive scorer would measure; keep it inside
  // the gate too, so the entry passes under either counting.
  if (text.length > MAX_CHARS) {
    problems.push(`pitch is ${text.length} UTF-16 units, over the ${MAX_CHARS} limit`);
  }

  if (text !== text.trim()) {
    problems.push("pitch has leading or trailing whitespace");
  }
  if (/[\r\n]/.test(text)) {
    problems.push("pitch must be a single line (no line breaks)");
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    problems.push("pitch contains control characters");
  }
  if (/  +/.test(text)) {
    problems.push("pitch contains a run of two or more spaces");
  }

  const endings = countSentenceEndings(text);
  if (endings !== 1 || !text.endsWith(".")) {
    problems.push(
      `pitch must be exactly one sentence ending in a period (found ${endings} sentence-ending mark${endings === 1 ? "" : "s"})`,
    );
  }

  const words = countWords(text);
  if (words < 10) {
    problems.push(`pitch has only ${words} words, too few to name the annoyance, the invention and its mechanism`);
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

function main(): void {
  const problems = validatePitch(PITCH);
  if (problems.length > 0) {
    throw new Error(`invalid pitch: ${problems.join("; ")}`);
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "entry.txt");
  writeFileSync(outFile, PITCH, "utf8");

  // Read back what was written and confirm it is byte-identical to the
  // pitch, so a partial or mangled write is caught here instead of being
  // silently graded as a different (or invalid) entry.
  const written = readFileSync(outFile, "utf8");
  if (written !== PITCH) {
    throw new Error("written entry.txt does not match the pitch");
  }

  console.log(
    `wrote ${countChars(PITCH)} characters (${countWords(PITCH)} words) to ${outFile}`,
  );
}

main();

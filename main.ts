import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Meet Pocket Hamster, a treadmill charger in your pocket that only powers your dying phone while you pace anxiously, turning every 1% panic into honest electricity.";

function validate(text: string): void {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("entry must be non-empty");
  }
  if (text.length > 220) {
    throw new Error(`entry exceeds 220 characters: ${text.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (!text.endsWith(".")) {
    throw new Error("entry must end with a period");
  }
  // Exactly one sentence: a single terminal period and no other
  // sentence-ending punctuation or line breaks anywhere in the text.
  const terminators = text.match(/[.!?]/g) ?? [];
  if (terminators.length !== 1) {
    throw new Error(`entry must be exactly one sentence, found ${terminators.length} terminators`);
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("entry must be a single line");
  }
}

validate(ENTRY);

const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "entry.txt"), ENTRY, "utf8");

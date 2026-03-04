interface SyntheticRecord {
  content: string;
  description: string;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randomWord(rng: () => number, min = 3, max = 11): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const length = Math.floor(rng() * (max - min + 1)) + min;
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(rng() * letters.length);
    out += letters[idx];
  }
  return out;
}

export function syntheticRecordAt(index: number, seed: number): SyntheticRecord {
  const rng = mulberry32(seed + index * 2654435761);
  const tokenA = randomWord(rng);
  const tokenB = randomWord(rng);
  const tokenC = randomWord(rng);
  const context = ["button", "title", "label", "error", "tooltip", "menu", "cta"];
  const source = ["checkout", "profile", "homepage", "settings", "search", "orders", "cart"];

  const content = `${tokenA} ${tokenB} ${tokenC}`;
  const description = `${context[Math.floor(rng() * context.length)]}:${source[Math.floor(rng() * source.length)]}:${index}`;

  return { content, description };
}

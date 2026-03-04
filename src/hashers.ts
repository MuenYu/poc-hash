import { createHash } from "node:crypto";
import murmur from "murmurhash3js-revisited";

import type { HashAlgorithm } from "./types.js";

export function generateTranslationId(
  content: string,
  description: string,
  algorithm: HashAlgorithm,
  length: number,
): string {
  const input = `${content}#${description}`;

  if (algorithm === "sha512") {
    const hash = createHash("sha512");
    hash.update(input);
    return hash.digest("base64").substring(0, length);
  }

  const murmurHex = murmur.x64.hash128(Buffer.from(input, "utf8"));
  const digestBase64 = Buffer.from(murmurHex, "hex").toString("base64");
  return digestBase64.substring(0, length);
}

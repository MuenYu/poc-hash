import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { runExperiment } from "./experiment.js";
import { toMarkdown } from "./format.js";
import { nativeAlgorithms } from "./hashers.js";
import type { ExperimentConfig, HashAlgorithm, HashEncoding } from "./types.js";

const supportedAlgorithms = [...nativeAlgorithms, "murmur3"] as const;
const supportedEncodings: HashEncoding[] = ["base64", "base64url"];

function isHashAlgorithm(value: string): value is HashAlgorithm {
  return (supportedAlgorithms as readonly string[]).includes(value);
}

function isHashEncoding(value: string): value is HashEncoding {
  return supportedEncodings.includes(value as HashEncoding);
}

function parseNumber(name: string, fallback: number): number {
  const arg = process.argv.find((item) => item.startsWith(`--${name}=`));
  if (!arg) {
    return fallback;
  }
  const value = Number(arg.split("=")[1]);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid --${name}: ${arg}`);
  }
  return Math.floor(value);
}

function parseLengths(fallback: number[]): number[] {
  const arg = process.argv.find((item) => item.startsWith("--lengths="));
  if (!arg) {
    return fallback;
  }

  const values = arg
    .split("=")[1]
    .split(",")
    .map((raw) => Number(raw.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => Math.floor(item));

  if (values.length === 0) {
    throw new Error(`Invalid --lengths: ${arg}`);
  }

  return [...new Set(values)].sort((a, b) => a - b);
}

function parseAlgorithms(fallback: HashAlgorithm[]): HashAlgorithm[] {
  const arg = process.argv.find((item) => item.startsWith("--algorithms="));
  if (!arg) {
    return fallback;
  }

  const values = arg
    .split("=")[1]
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is HashAlgorithm => isHashAlgorithm(item));

  if (values.length === 0) {
    throw new Error(`Invalid --algorithms: ${arg}`);
  }

  return [...new Set(values)];
}

function parseEncodings(fallback: HashEncoding[]): HashEncoding[] {
  const arg = process.argv.find((item) => item.startsWith("--encodings="));
  if (!arg) {
    return fallback;
  }

  const values = arg
    .split("=")[1]
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is HashEncoding => isHashEncoding(item));

  if (values.length === 0) {
    throw new Error(`Invalid --encodings: ${arg}`);
  }

  return [...new Set(values)];
}

async function main(): Promise<void> {
  const config: ExperimentConfig = {
    records: parseNumber("records", 300_000),
    lengths: parseLengths([6, 7, 8, 9, 10, 11, 12, 13, 14]),
    algorithms: parseAlgorithms(["md5", "sha1", "sha256", "sha512", "murmur3"]),
    encodings: parseEncodings(["base64", "base64url"]),
    seed: parseNumber("seed", 42),
  };

  const rows = runExperiment(config);
  const markdown = toMarkdown(config, rows);

  const outputDir = resolve(process.cwd(), "results");
  await mkdir(outputDir, { recursive: true });

  await Promise.all([
    writeFile(resolve(outputDir, "latest.md"), markdown, "utf8"),
    writeFile(resolve(outputDir, "latest.json"), `${JSON.stringify({ config, rows }, null, 2)}\n`, "utf8"),
  ]);

  process.stdout.write(`${markdown}\n`);
  process.stdout.write(`\nSaved: ${resolve(outputDir, "latest.md")}\n`);
  process.stdout.write(`Saved: ${resolve(outputDir, "latest.json")}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

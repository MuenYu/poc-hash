import type { ExperimentConfig, ExperimentRow } from "./types.js";

function pct(value: number): string {
  return `${(value * 100).toFixed(6)}%`;
}

function fixed(value: number, digits = 2): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "n/a";
}

export function toMarkdown(config: ExperimentConfig, rows: ExperimentRow[]): string {
  const lines: string[] = [];

  lines.push("## Experiment Results");
  lines.push("");
  lines.push(`- Records: ${config.records.toLocaleString()}`);
  lines.push(`- Algorithms: ${config.algorithms.join(", ")}`);
  lines.push(`- Substring lengths: ${config.lengths.join(", ")}`);
  lines.push(`- Seed: ${config.seed}`);
  lines.push("");
  lines.push("| Algorithm | Length | Collisions | Collision Rate | Unique IDs | Time (ms) | Throughput (ops/s) | Expected Collision Pairs | P(>=1 collision) |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|");

  for (const row of rows) {
    lines.push(
      `| ${row.algorithm} | ${row.length} | ${row.collisions} | ${pct(row.collisionRate)} | ${row.unique} | ${fixed(row.elapsedMs, 1)} | ${fixed(row.opsPerSec, 0)} | ${fixed(row.expectedCollisionPairs, 6)} | ${pct(row.probabilityAtLeastOneCollision)} |`,
    );
  }

  lines.push("");
  lines.push("_Tip: for very large N, expected collision pairs ~= N*(N-1)/(2*64^L), where L is base64 substring length._");

  return lines.join("\n");
}

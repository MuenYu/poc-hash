import { syntheticRecordAt } from "./data.js";
import { generateTranslationId } from "./hashers.js";
import type { ExperimentConfig, ExperimentRow } from "./types.js";

function expectedCollisionPairs(records: number, length: number): number {
  const space = 64 ** length;
  return (records * (records - 1)) / (2 * space);
}

function probabilityAtLeastOneCollision(records: number, length: number): number {
  const lambda = expectedCollisionPairs(records, length);
  return 1 - Math.exp(-lambda);
}

function runSingle(
  config: ExperimentConfig,
  algorithm: ExperimentRow["algorithm"],
  encoding: ExperimentRow["encoding"],
  length: number,
): ExperimentRow {
  const seen = new Set<string>();
  let collisions = 0;

  const started = process.hrtime.bigint();
  for (let i = 0; i < config.records; i += 1) {
    const { content, description } = syntheticRecordAt(i, config.seed);
    const id = generateTranslationId(content, description, algorithm, encoding, length);

    if (seen.has(id)) {
      collisions += 1;
    } else {
      seen.add(id);
    }
  }
  const ended = process.hrtime.bigint();

  const elapsedMs = Number(ended - started) / 1_000_000;
  const unique = seen.size;

  return {
    algorithm,
    encoding,
    length,
    records: config.records,
    unique,
    collisions,
    collisionRate: collisions / config.records,
    elapsedMs,
    opsPerSec: config.records / (elapsedMs / 1000),
    expectedCollisionPairs: expectedCollisionPairs(config.records, length),
    probabilityAtLeastOneCollision: probabilityAtLeastOneCollision(config.records, length),
  };
}

export function runExperiment(config: ExperimentConfig): ExperimentRow[] {
  const rows: ExperimentRow[] = [];

  for (const algorithm of config.algorithms) {
    for (const encoding of config.encodings) {
      for (const length of config.lengths) {
        rows.push(runSingle(config, algorithm, encoding, length));
      }
    }
  }

  return rows;
}

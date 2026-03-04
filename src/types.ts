export type HashAlgorithm =
  | "md5"
  | "sha1"
  | "sha256"
  | "sha384"
  | "sha512"
  | "murmur3";

export interface ExperimentConfig {
  records: number;
  lengths: number[];
  algorithms: HashAlgorithm[];
  seed: number;
}

export interface ExperimentRow {
  algorithm: HashAlgorithm;
  length: number;
  records: number;
  unique: number;
  collisions: number;
  collisionRate: number;
  elapsedMs: number;
  opsPerSec: number;
  expectedCollisionPairs: number;
  probabilityAtLeastOneCollision: number;
}

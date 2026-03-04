# Hash Collision and Speed PoC Report

## Goal
Evaluate collision risk and throughput for translation ID generation using:

- `sha512 + base64 + substring(N)`
- `murmur3 + base64 + substring(N)`

with focus on collision safety first, speed second.

## Setup

- Runtime: Node.js (TypeScript)
- Dataset: synthetic `(content, description)` pairs, deterministic seed
- Main run command:

```bash
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10 --algorithms=sha512,murmur3 --seed=42
```

Latest machine outputs are also saved to:

- `results/latest.md`
- `results/latest.json`

## Results (1,000,000 records)

| Algorithm | Length | Collisions | Collision Rate | Throughput (ops/s) |
|---|---:|---:|---:|---:|
| sha512 | 6 | 5 | 0.000500% | 649,399 |
| sha512 | 7 | 1 | 0.000100% | 637,918 |
| sha512 | 8 | 0 | 0.000000% | 612,665 |
| sha512 | 9 | 0 | 0.000000% | 600,598 |
| sha512 | 10 | 0 | 0.000000% | 588,798 |
| murmur3 | 6 | 5 | 0.000500% | 284,173 |
| murmur3 | 7 | 0 | 0.000000% | 272,760 |
| murmur3 | 8 | 0 | 0.000000% | 249,882 |
| murmur3 | 9 | 0 | 0.000000% | 246,501 |
| murmur3 | 10 | 0 | 0.000000% | 281,299 |

## Interpretation

1. Collision behavior is dominated by substring length, not algorithm choice.
2. At 1,000,000 records, `length=6` and `length=7` already show measurable risk.
3. `length>=8` looks safe for 1,000,000 records in this run.
4. In this JavaScript implementation, `sha512` is faster than the selected Murmur3 package.
   - This can happen because SHA-512 is native/OpenSSL-backed in Node.
   - The Murmur3 package here is pure JavaScript.

## Extrapolation to 1 Billion Records

Using birthday-bound approximation for base64 substring space (`64^N`):

Expected collision pairs: `lambda ~= n*(n-1)/(2*64^N)`

Probability of at least one collision: `1 - exp(-lambda)`

| Length (N) | Expected Collision Pairs | P(>=1 collision) |
|---:|---:|---:|
| 8 | 1776.356838 | ~100% |
| 9 | 27.755576 | ~100% |
| 10 | 0.433681 | 35.188094% |
| 11 | 0.006776 | 0.675336% |
| 12 | 0.000106 | 0.010587% |
| 13 | 0.000002 | 0.000165% |
| 14 | 0.000000 | 0.000003% |

## Recommendation

- If targeting up to 1 billion records and collision avoidance is high priority:
  - `substring(10)` is not enough (about 35% chance of at least one collision).
  - Prefer at least `substring(12)`.
  - Use `substring(13)` or `substring(14)` if you want larger safety margin.
- For speed in Node.js, keep SHA-512 unless you benchmark a native (non-JS) fast hash implementation that is clearly faster in your production environment.

## Repro Steps

```bash
npm install
npm run typecheck
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10 --algorithms=sha512,murmur3 --seed=42
```

Optional: test larger lengths for 1B-style safety margin:

```bash
npm run experiment -- --records=1000000 --lengths=10,11,12,13,14 --algorithms=sha512,murmur3 --seed=42
```

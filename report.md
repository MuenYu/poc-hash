# Hash Collision and Speed PoC Report

## Goal

Evaluate collision risk and throughput for translation ID generation using:

- OpenSSL-backed Node hashes: `md5`, `sha1`, `sha256`, `sha384`, `sha512`
- `murmur3` (JavaScript package baseline)

Security is intentionally out of scope in this PoC; collision behavior and speed are the priorities.

## Setup

- Runtime: Node.js (TypeScript)
- Dataset: synthetic deterministic `(content, description)` pairs
- Main run command:

```bash
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10 --algorithms=md5,sha1,sha256,sha384,sha512,murmur3 --seed=42
```

Latest machine outputs are saved to:

- `results/latest.md`
- `results/latest.json`

## Results (1,000,000 records)

| Algorithm | Length | Collisions | Collision Rate | Throughput (ops/s) |
|---|---:|---:|---:|---:|
| md5 | 6 | 13 | 0.001300% | 674,637 |
| md5 | 7 | 0 | 0.000000% | 664,546 |
| md5 | 8 | 0 | 0.000000% | 681,068 |
| md5 | 9 | 0 | 0.000000% | 688,536 |
| md5 | 10 | 0 | 0.000000% | 683,669 |
| sha1 | 6 | 11 | 0.001100% | 683,694 |
| sha1 | 7 | 0 | 0.000000% | 709,262 |
| sha1 | 8 | 0 | 0.000000% | 706,851 |
| sha1 | 9 | 0 | 0.000000% | 699,979 |
| sha1 | 10 | 0 | 0.000000% | 695,134 |
| sha256 | 6 | 4 | 0.000400% | 709,480 |
| sha256 | 7 | 0 | 0.000000% | 693,030 |
| sha256 | 8 | 0 | 0.000000% | 693,785 |
| sha256 | 9 | 0 | 0.000000% | 699,805 |
| sha256 | 10 | 0 | 0.000000% | 692,622 |
| sha384 | 6 | 8 | 0.000800% | 670,809 |
| sha384 | 7 | 0 | 0.000000% | 672,603 |
| sha384 | 8 | 0 | 0.000000% | 670,583 |
| sha384 | 9 | 0 | 0.000000% | 658,799 |
| sha384 | 10 | 0 | 0.000000% | 657,217 |
| sha512 | 6 | 5 | 0.000500% | 642,967 |
| sha512 | 7 | 1 | 0.000100% | 656,485 |
| sha512 | 8 | 0 | 0.000000% | 661,634 |
| sha512 | 9 | 0 | 0.000000% | 649,092 |
| sha512 | 10 | 0 | 0.000000% | 662,366 |
| murmur3 | 6 | 5 | 0.000500% | 288,065 |
| murmur3 | 7 | 0 | 0.000000% | 293,066 |
| murmur3 | 8 | 0 | 0.000000% | 295,725 |
| murmur3 | 9 | 0 | 0.000000% | 295,992 |
| murmur3 | 10 | 0 | 0.000000% | 297,493 |

## Interpretation

1. Collision behavior is dominated by substring length (`N`), not by hash family.
2. At 1,000,000 records, `N=6` still collides; `N>=7` looked collision-free in this run except one `sha512` case at `N=7`.
3. Native/OpenSSL-backed hashes in Node are all much faster than the JavaScript Murmur3 package in this setup.
4. Among native options here, `sha1` and `sha256` were the fastest overall, with `md5` very close.

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
  - Use `substring(13)` or `substring(14)` for extra safety margin.
- If security is not a concern and speed is the focus in Node:
  - Prefer native/OpenSSL-backed algorithms over this JavaScript Murmur3 package.
  - In this run, `sha1` or `sha256` are good default speed choices.

## Repro Steps

```bash
npm install
npm run typecheck
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10 --algorithms=md5,sha1,sha256,sha384,sha512,murmur3 --seed=42
```

Optional: test larger lengths for 1B-style safety margin:

```bash
npm run experiment -- --records=1000000 --lengths=10,11,12,13,14 --algorithms=sha256,sha512,murmur3 --seed=42
```

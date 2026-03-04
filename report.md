# Hash Collision and Speed PoC Report

## Goal

Evaluate collision risk and throughput for translation ID generation using:

- OpenSSL-backed Node hashes: `md5`, `sha1`, `sha256`, `sha384`, `sha512`
- `murmur3` (JavaScript package baseline)
- Encodings: `base64` and `base64url`

Security is intentionally out of scope in this PoC; collision behavior and speed are the priorities.

## Setup

- Runtime: Node.js (TypeScript)
- Dataset: synthetic deterministic `(content, description)` pairs
- Main run command:

```bash
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10,11,12,13,14 --encodings=base64,base64url --algorithms=md5,sha1,sha256,sha384,sha512,murmur3 --seed=42
```

Latest machine outputs are saved to:

- `results/latest.md`
- `results/latest.json`

## Results (1,000,000 records)

Full raw output is in `results/latest.md` and `results/latest.json` (108 rows: 6 algorithms x 2 encodings x 9 lengths).

Key observations from this run:

| Check | Finding |
|---|---|
| Collision count (`base64` vs `base64url`) | Same for every algorithm/length pair in this dataset |
| Collision trend by length | `L=6` collides, `L=7` has one `sha512` collision, `L>=8` is 0 in this run |
| Throughput impact of encoding | Very small differences; typically noise-level |
| Fastest family in this run | Native OpenSSL-backed hashes (`sha1`/`md5` near top) |
| Slowest option in this run | `murmur3` package is much slower than native hashes |

## Interpretation

1. Collision behavior is dominated by substring length (`N`), not by base64 vs base64url choice.
2. At 1,000,000 records, `N=6` still collides, `N=7` has one `sha512` collision, and `N>=8` was collision-free in this run.
3. `base64` and `base64url` behave the same for collision risk at a given length (same 64-symbol space size).
4. Native/OpenSSL-backed hashes in Node are much faster than the JavaScript Murmur3 package in this setup.
5. Among native options here, `sha1` and `md5` were the fastest overall.

## Extrapolation to 1 Billion Records

Using birthday-bound approximation for base64/base64url substring space (`64^N`):

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
- If you need URL-safe IDs, use `base64url`; collision profile is equivalent to `base64` at the same substring length.
- If security is not a concern and speed is the focus in Node:
  - Prefer native/OpenSSL-backed algorithms over this JavaScript Murmur3 package.
  - In this run, `sha1` or `md5` are good default speed choices.

## Repro Steps

```bash
npm install
npm run typecheck
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10,11,12,13,14 --encodings=base64,base64url --algorithms=md5,sha1,sha256,sha384,sha512,murmur3 --seed=42
```

Optional: focus on larger lengths for 1B-style safety margin:

```bash
npm run experiment -- --records=1000000 --lengths=10,11,12,13,14 --encodings=base64,base64url --algorithms=sha256,sha512,murmur3 --seed=42
```

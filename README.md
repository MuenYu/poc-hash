## Task Definition
You need to create a typescript project for proof of concept usage

exploring collision rate under different hash implementation in huge data scenarios (e.g. 1 billion records)
Your concern includes: (order by priority)

1. collision rate: is the substring length is enough, or should be longer? how long should be enough?
2. performance/speed: is SHA512 slow? if security is not the concern here, is it worth to change to other algorithm (e.g. murmurhash3)

---

## Algorithms you need to test
### SHA512 + BASE64 + substring 10
this is the algorithm we are using now

```ts
// generate id by content and description
export function generateTranslationId(
	content: string,
	description: string,
): string {
	const hash = createHash('sha512');
	hash.update(`${content}#${description}`);
	return hash.digest('base64').substring(0, 10);
}
```

### Variants: OpenSSL-backed hashes + BASE64 + substring

- `md5`
- `sha1`
- `sha256`
- `sha384`
- `sha512`

All of the above are generated with Node's `crypto.createHash(...)` (native/OpenSSL-backed).

### Variant: Murmurhash3 + BASE64 + substring
```ts
export function generateTranslationId(
	content: string,
	description: string,
): string {
  // You implement your own
}
```

## After the research, what you should get
1. full PoC codebase, with clean/simple/easily-readable code implementation
2. a concise `report.md` to introduce your findings with steps to reproduce your experiment

---

## PoC Usage

```bash
npm install
npm run typecheck
npm run experiment
```

### Useful experiment args

- `--records=<number>`: number of records to test
- `--lengths=6,7,8,9,10`: base64 substring lengths
- `--algorithms=md5,sha1,sha256,sha384,sha512,murmur3`: algorithms to compare
- `--seed=<number>`: deterministic synthetic data seed

Example:

```bash
npm run experiment -- --records=1000000 --lengths=6,7,8,9,10 --algorithms=md5,sha1,sha256,sha384,sha512,murmur3 --seed=42
```

Outputs:

- `results/latest.md`
- `results/latest.json`
- terminal table

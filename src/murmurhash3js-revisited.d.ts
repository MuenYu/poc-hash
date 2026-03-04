declare module "murmurhash3js-revisited" {
  interface MurmurLib {
    x64: {
      hash128(input: ArrayLike<number>, seed?: number): string;
    };
  }

  const murmur: MurmurLib;
  export default murmur;
}

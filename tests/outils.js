// Générateur pseudo-aléatoire reproductible, pour des tests qui donnent toujours le même résultat.
export function rngFixe(graine = 42) {
  let s = graine >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

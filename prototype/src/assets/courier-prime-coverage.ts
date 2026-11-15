/** Code points in all four Courier Prime faces (generated from the font files; regenerate if the fonts change). */
const RANGES: [number, number][] = [
  [13, 13],
  [32, 126],
  [160, 311],
  [313, 328],
  [330, 382],
  [402, 402],
  [536, 539],
  [567, 567],
  [710, 711],
  [728, 733],
  [806, 806],
  [916, 916],
  [937, 937],
  [956, 956],
  [960, 960],
  [7808, 7813],
  [7922, 7923],
  [8209, 8209],
  [8211, 8212],
  [8216, 8218],
  [8220, 8222],
  [8224, 8226],
  [8230, 8230],
  [8240, 8240],
  [8242, 8243],
  [8249, 8250],
  [8260, 8260],
  [8308, 8308],
  [8355, 8355],
  [8361, 8361],
  [8364, 8364],
  [8482, 8482],
  [8706, 8706],
  [8719, 8719],
  [8721, 8722],
  [8725, 8725],
  [8730, 8730],
  [8734, 8734],
  [8747, 8747],
  [8776, 8776],
  [8800, 8800],
  [8804, 8805],
  [9674, 9674],
  [64257, 64258],
];

export function uncoveredChars(text: string): string[] {
  const missing = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp <= 32 || (cp >= 127 && cp < 160) || cp === 0x200b || cp === 0xfeff) continue;
    if (!RANGES.some(([a, b]) => cp >= a && cp <= b)) missing.add(ch);
  }
  return [...missing];
}

/**
 * 88x31 badge icons: 11x11 bitmaps drawn with 2px cells in the badge's icon
 * well. `#` is a lit cell. Colours come from the `--badge-<type>` tokens in
 * site-theme.css; unknown types use the generic `link` icon.
 */
export type BadgeIcon = {
  /** One-line badge text. */
  label: string;
  /** Tooltip and accessible name. */
  title: string;
  bitmap: string[];
};

const FLOPPY = [
  "#########..",
  "##.....###.",
  "##.....####",
  "##.....####",
  "###########",
  "###########",
  "#.........#",
  "#.........#",
  "#.........#",
  "#.........#",
  "###########",
];

export const BADGE_ICONS: Record<string, BadgeIcon> = {
  github: {
    label: "github",
    title: "GitHub",
    bitmap: [
      ".#.......#.",
      ".##.....##.",
      ".#########.",
      "###########",
      "##..###..##",
      "##..###..##",
      "###########",
      ".#########.",
      "..#.###.#..",
      "...#####...",
      "....#.#....",
    ],
  },
  gitlab: {
    label: "gitlab",
    title: "GitLab",
    bitmap: [
      "#.........#",
      "##.......##",
      "###.....###",
      "###########",
      "###########",
      ".#########.",
      "..#######..",
      "...#####...",
      "....###....",
      ".....#.....",
      "...........",
    ],
  },
  codeberg: {
    label: "codeberg",
    title: "Codeberg",
    bitmap: [
      ".....#.....",
      "....###....",
      "....###....",
      "...#####...",
      "...##.##...",
      "..##...##..",
      "..##...##..",
      ".##.....##.",
      ".##.....##.",
      "###########",
      "...........",
    ],
  },
  srht: {
    label: "srht",
    title: "SourceHut",
    bitmap: [
      "...#####...",
      "..#.....#..",
      ".#.......#.",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      "#.........#",
      ".#.......#.",
      "..#.....#..",
      "...#####...",
    ],
  },
  linkedin: {
    label: "linkedin",
    title: "LinkedIn",
    bitmap: [
      "###########",
      "#.........#",
      "#.#.......#",
      "#.........#",
      "#.#.#.##..#",
      "#.#.##..#.#",
      "#.#.#...#.#",
      "#.#.#...#.#",
      "#.#.#...#.#",
      "#.........#",
      "###########",
    ],
  },
  mastodon: {
    label: "mastodon",
    title: "Mastodon",
    bitmap: [
      "...........",
      ".#########.",
      "###########",
      "##.#####.##",
      "##.#.#.#.##",
      "##.#.#.#.##",
      "##.#.#.#.##",
      "###########",
      ".########..",
      ".......##..",
      "...........",
    ],
  },
  bluesky: {
    label: "bluesky",
    title: "Bluesky",
    bitmap: [
      "...........",
      "##.......##",
      "###.....###",
      "####...####",
      "#####.#####",
      ".####.####.",
      "..###.###..",
      ".####.####.",
      ".###...###.",
      "..#.....#..",
      "...........",
    ],
  },
  stack: {
    label: "stack",
    title: "Stack Overflow",
    bitmap: [
      ".......#...",
      "......#....",
      "....##.....",
      "..###......",
      "...........",
      ".#######...",
      "...........",
      "#.........#",
      "#.#######.#",
      "#.........#",
      "###########",
    ],
  },
  hackaday: {
    label: "hackaday",
    title: "Hackaday.io",
    bitmap: [
      "...#####...",
      "..#######..",
      ".#########.",
      ".##..#..##.",
      ".##..#..##.",
      ".#########.",
      "..###.###..",
      "...#####...",
      "...#.#.#...",
      "...........",
      "...........",
    ],
  },
  crates: {
    label: "crates",
    title: "crates.io",
    bitmap: [
      "...........",
      "###########",
      "#.........#",
      "###########",
      "#.#.#.#.#.#",
      "#.#.#.#.#.#",
      "#.#.#.#.#.#",
      "#.#.#.#.#.#",
      "###########",
      "...........",
      "...........",
    ],
  },
  email: {
    label: "email",
    title: "Email",
    bitmap: [
      "...........",
      "###########",
      "##.......##",
      "#.#.....#.#",
      "#..#...#..#",
      "#...#.#...#",
      "#....#....#",
      "#.........#",
      "###########",
      "...........",
      "...........",
    ],
  },
  rss: {
    label: "rss",
    title: "RSS feed",
    bitmap: [
      "#####......",
      ".....##....",
      ".......#...",
      "###.....#..",
      "...##....#.",
      ".....#...#.",
      "##....#...#",
      "###...#...#",
      "###...#...#",
      "...........",
      "...........",
    ],
  },
  sparkle: {
    label: "sparkle",
    title: "Sparkle",
    bitmap: [
      ".....#.....",
      ".....#.....",
      "....###....",
      "....###....",
      ".#########.",
      "..#######..",
      "....###....",
      "....###....",
      ".....#.....",
      ".....#.....",
      "...........",
    ],
  },
  "512kb-green": {
    label: "512kb club",
    title: "512KB Club, green team",
    bitmap: FLOPPY,
  },
  "512kb-orange": {
    label: "512kb club",
    title: "512KB Club, orange team",
    bitmap: FLOPPY,
  },
  "512kb-blue": {
    label: "512kb club",
    title: "512KB Club, blue team",
    bitmap: FLOPPY,
  },
  "250kb": {
    label: "250kb club",
    title: "250KB Club",
    bitmap: FLOPPY,
  },
  "1mb": {
    label: "1mb club",
    title: "1MB Club",
    bitmap: FLOPPY,
  },
  darktheme: {
    label: "dark theme",
    title: "Proud member of darktheme.club",
    bitmap: [
      "...###.....",
      "..##.......",
      ".##........",
      "###........",
      "###........",
      "###........",
      "####......#",
      "#####....##",
      ".#########.",
      "..#######..",
      "...#####...",
    ],
  },
  nocookies: {
    label: "no cookies",
    title: "No cookies",
    bitmap: [
      "...#####...",
      "..#.....#..",
      ".#.#.....#.",
      "#...#.....#",
      "#....#....#",
      "#.....#...#",
      "#......#..#",
      "#.......#.#",
      ".#.......#.",
      "..#.....#..",
      "...#####...",
    ],
  },
  link: {
    label: "link",
    title: "Link",
    bitmap: [
      "......#####",
      ".........##",
      "........#.#",
      "#####..#..#",
      "#.....#....",
      "#....#.....",
      "#..........",
      "#.........#",
      "#.........#",
      "#.........#",
      "###########",
    ],
  },
};

/** The icon of a badge type, the generic one for unknown types. */
export const badgeIcon = (type: string): BadgeIcon =>
  Object.hasOwn(BADGE_ICONS, type) ? BADGE_ICONS[type] : BADGE_ICONS.link;

/** Badge types that are profiles of the site owner (`rel="me"`). */
export const PROFILE_BADGES = new Set([
  "github",
  "gitlab",
  "codeberg",
  "srht",
  "linkedin",
  "mastodon",
  "bluesky",
  "stack",
  "hackaday",
  "crates",
  "lemmy",
  "x",
  "reddit",
  "devto",
  "medium",
]);

/** The profile entries of `links`, in order. */
export const profileLinks = <T extends { type: string }>(links: T[]): T[] =>
  links.filter(link => PROFILE_BADGES.has(link.type));

/** Horizontal runs of lit cells: [column, row, length]. */
export function bitmapRuns(bitmap: string[]): [number, number, number][] {
  const runs: [number, number, number][] = [];
  bitmap.forEach((row, y) => {
    for (const match of row.matchAll(/#+/g)) {
      runs.push([match.index ?? 0, y, match[0].length]);
    }
  });
  return runs;
}

export type BadgeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export const BADGE_TEXT = { x: 59, y: 19.5, squeezeAbove: 9, width: 52 };

export function badgeRects(bitmap: string[], iconFill: string): BadgeRect[] {
  return [
    { x: 0, y: 0, width: 88, height: 31, fill: "--b-edge" },
    { x: 1, y: 1, width: 86, height: 29, fill: "--b-face" },
    { x: 1, y: 1, width: 86, height: 1, fill: "--b-hi" },
    { x: 1, y: 1, width: 1, height: 29, fill: "--b-hi" },
    { x: 1, y: 29, width: 86, height: 1, fill: "--b-lo" },
    { x: 86, y: 1, width: 1, height: 29, fill: "--b-lo" },
    { x: 2, y: 2, width: 28, height: 27, fill: "--b-icon" },
    ...bitmapRuns(bitmap).map(([x, y, length]) => ({
      x: 5 + x * 2,
      y: 5 + y * 2,
      width: length * 2,
      height: 2,
      fill: iconFill,
    })),
    { x: 30, y: 2, width: 1, height: 27, fill: "--b-lo" },
  ];
}

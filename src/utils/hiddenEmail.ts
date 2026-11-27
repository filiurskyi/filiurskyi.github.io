export const EMAIL_CONTACT_PATH = "/contact/#email";

export const encodeEmail = (target: string): string =>
  btoa([...target].reverse().join(""));

export const decodeEmail = (encoded: string): string =>
  [...atob(encoded)].reverse().join("");

export const spellEmail = (target: string): string =>
  (target.split("?")[0] ?? "")
    .replace("@", " [at] ")
    .replaceAll(".", " [dot] ");

export const EMAIL_CONTACT_PATH = "/contact/#email";

/** href of a `keepMailto` badge until the script fills in the address. */
export const BARE_MAILTO = "mailto:";

export const encodeEmail = (target: string): string =>
  btoa([...target].reverse().join(""));

export const decodeEmail = (encoded: string): string =>
  [...atob(encoded)].reverse().join("");

/** Whether `encoded` is encodeEmail() of an address, with or without a query. */
export const isEncodedEmail = (encoded: string): boolean => {
  try {
    const target = decodeEmail(encoded);
    return (
      encodeEmail(target) === encoded &&
      /^[^@\s?]+@[^@\s?]+(\?\S*)?$/.test(target)
    );
  } catch {
    return false;
  }
};

/**
 * The encoded mailto: target of a `hideAddress` badge: `encodedAddress`, or
 * the address of its mailto: `url`.
 */
export const hiddenTarget = (link: {
  url?: string;
  hideAddress?: boolean;
  encodedAddress?: string;
}): string | undefined => {
  if (!link.hideAddress) return undefined;
  return (
    link.encodedAddress ??
    encodeEmail((link.url ?? "").trim().replace(/^mailto:/i, ""))
  );
};

export const spellEmail = (target: string): string =>
  (target.split("?")[0] ?? "")
    .replace("@", " [at] ")
    .replaceAll(".", " [dot] ");

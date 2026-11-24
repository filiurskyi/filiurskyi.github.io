import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

const hasNonLatin = (str: string): boolean => /[^\x00-\x7F]/.test(str);

/** Latin text via slugify; anything with non-Latin chars via kebabcase, which keeps them. */
export const slugifyStr = (str: string): string => {
  if (hasNonLatin(str)) {
    return kebabcase(str);
  }
  return slugify(str, { lower: true });
};

/** True when `str` has a letter or digit in any script, so its slug means something. */
export const hasLetterOrDigit = (str: string): boolean =>
  /[\p{L}\p{N}]/u.test(str);

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

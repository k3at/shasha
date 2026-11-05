const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** يوحّد الحروف العربية الشائعة ليجعل البحث متسامحاً مع الهمزات والتاء المربوطة. */
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFKC")
    .replace(DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .trim();
}

export function matchesQuery(haystack: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearch(haystack).includes(normalizedQuery);
}

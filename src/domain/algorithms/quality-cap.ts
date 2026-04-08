/**
 * Session-scoped quality cap: prevents inflated self-assessment after
 * a low score on the same chunk within the current session.
 *
 * Cap rules (based on minimum prior quality in session):
 *   min prior 0–1  →  cap incoming at 3
 *   min prior = 2  →  cap incoming at 4
 *   min prior ≥ 3  →  no cap
 *   no priors       →  no cap
 */
export function computeQualityCap(
  minPriorQuality: number | undefined,
  incomingQuality: number
): { quality: number; wasCapped: boolean } {
  if (minPriorQuality === undefined || minPriorQuality >= 3) {
    return { quality: incomingQuality, wasCapped: false };
  }

  const cap = minPriorQuality <= 1 ? 3 : 4; // minPriorQuality is 0, 1, or 2
  if (incomingQuality <= cap) {
    return { quality: incomingQuality, wasCapped: false };
  }

  return { quality: cap, wasCapped: true };
}

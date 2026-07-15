/**
 * Pure durability gate for prerequisite unlocking
 * (NEU-931, charter C007 — MM-T8 Gate C posterior sub-gate).
 *
 * A dependent stays LOCKED until the prerequisite's retrievability-posterior
 * durability signal clears the bar. The posterior is a Bayesian estimate of the
 * prerequisite's recall reliability, updated from the learner's persisted
 * multi-observation review history (graded pass/fail attempts). Thin history
 * FAILS CLOSED: too few observations can never clear a high bar, so a
 * single-success (even zero-review) prerequisite never unlocks its dependent —
 * replacing the prior 0.5 estimated-retrievability reteach rule.
 *
 * This is ONLY the posterior sub-gate of MM-T8's composite Gate C
 * (Gate C = Gate B cleared AND posterior >= B*). The Gate-B
 * non-massed/separated-session component is C2 (deferred); C007 unlocks on the
 * posterior sub-gate alone.
 *
 * Pure — no I/O. Persistence/logging of the emitted gate-decision records
 * happens at the adapter/orchestration boundary.
 */

/**
 * Conservative, uninformative Beta prior over recall reliability. Beta(1,1) is
 * uniform on [0,1]; its mean (0.5) sits well below any real durability bar, so
 * an unobserved prerequisite fails closed. A single success moves the posterior
 * mean to 2/3 — still short of a 0.90 bar — so speed alone never unlocks.
 */
export const DURABILITY_PRIOR_ALPHA = 1;
export const DURABILITY_PRIOR_BETA = 1;

/**
 * Summary of a prerequisite's persisted multi-observation review history.
 * `successes` / `failures` are graded-attempt counts (recall succeeded vs.
 * lapsed); the posterior is a function of these counts alone (attempts are
 * exchangeable under the Beta-Binomial model, so ordering is not needed).
 */
export type ReviewObservationCounts = {
  successes: number;
  failures: number;
};

/**
 * Auditable record of a single gate evaluation (OUT-7). Emitted on BOTH the
 * unlock (`passed: true`) and lock/fail-closed (`passed: false`) paths so the
 * decision is observable rather than advancing implicitly.
 */
export type GateDecision = {
  prerequisiteId: string;
  /** Retrievability-posterior in [0,1] — the evaluated durability signal. */
  signal: number;
  /** The durability bar the signal was compared against. */
  bar: number;
  /** true => durable enough to unlock; false => fail-closed / stays locked. */
  passed: boolean;
  successes: number;
  failures: number;
};

/**
 * Posterior mean of recall reliability under a Beta-Binomial model. Monotonic:
 * strictly increases with each success and strictly decreases with each
 * failure. With the Beta(1,1) prior an empty history returns 0.5, so an
 * unobserved prerequisite is below any real durability bar (fail-closed).
 */
export function computeRetrievabilityPosterior(obs: ReviewObservationCounts): number {
  const successes = Math.max(0, obs.successes);
  const failures = Math.max(0, obs.failures);
  const alpha = DURABILITY_PRIOR_ALPHA + successes;
  const beta = DURABILITY_PRIOR_BETA + failures;
  return alpha / (alpha + beta);
}

/**
 * Durability predicate: is the prerequisite durable enough to unlock its
 * dependent? True only when the retrievability-posterior clears the bar; a
 * thin/single-success history never does (fail-closed).
 */
export function isPrerequisiteSatisfied(
  obs: ReviewObservationCounts,
  durabilityBar: number
): boolean {
  return computeRetrievabilityPosterior(obs) >= durabilityBar;
}

/**
 * Evaluate the gate and return the auditable decision record. The caller
 * (orchestration/adapter boundary) is responsible for emitting/persisting it.
 */
export function evaluatePrerequisiteGate(
  prerequisiteId: string,
  obs: ReviewObservationCounts,
  durabilityBar: number
): GateDecision {
  const successes = Math.max(0, obs.successes);
  const failures = Math.max(0, obs.failures);
  const signal = computeRetrievabilityPosterior({ successes, failures });
  return {
    prerequisiteId,
    signal,
    bar: durabilityBar,
    passed: signal >= durabilityBar,
    successes,
    failures,
  };
}

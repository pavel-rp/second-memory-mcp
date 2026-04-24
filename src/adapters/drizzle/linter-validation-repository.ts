import { and, asc, eq, sql } from 'drizzle-orm';
import { getSql, type SqlDb } from '../../infrastructure/db/operations.js';
import {
  linterValidationCorpus,
  linterRuleValidationReport,
} from '../../infrastructure/db/schema.js';
import type {
  CorpusEntry,
  CorpusEntryInput,
  CorpusSplit,
  ExpectedVerdict,
  LinterValidationRepository,
  RuleValidationReport,
} from '../../ports/linter-validation-repository.js';

export class DrizzleLinterValidationRepository implements LinterValidationRepository {
  constructor(private db: SqlDb = getSql()) {}

  async listCorpusByRule(ruleId: string): Promise<CorpusEntry[]> {
    const rows = await this.db
      .select()
      .from(linterValidationCorpus)
      .where(eq(linterValidationCorpus.ruleId, ruleId))
      .orderBy(asc(linterValidationCorpus.id));
    return rows.map(rowToCorpusEntry);
  }

  async upsertCorpusEntry(entry: CorpusEntryInput): Promise<void> {
    // ON CONFLICT on the logical key `(rule_id, chunk_id)` refreshes the
    // mutable payload fields and bumps `updated_at`; `created_at` is
    // preserved by omitting it from the update set.
    await this.db
      .insert(linterValidationCorpus)
      .values({
        ruleId: entry.ruleId,
        chunkId: entry.chunkId,
        split: entry.split,
        expectedVerdict: entry.expectedVerdict,
        notes: entry.notes ?? null,
      })
      .onConflictDoUpdate({
        target: [linterValidationCorpus.ruleId, linterValidationCorpus.chunkId],
        set: {
          split: entry.split,
          expectedVerdict: entry.expectedVerdict,
          notes: entry.notes ?? null,
          updatedAt: sql`NOW()`,
        },
      });
  }

  async deleteCorpusEntry(ruleId: string, chunkId: string): Promise<number> {
    const res = await this.db
      .delete(linterValidationCorpus)
      .where(
        and(eq(linterValidationCorpus.ruleId, ruleId), eq(linterValidationCorpus.chunkId, chunkId))
      );
    return res.rowCount ?? 0;
  }

  async getReport(ruleId: string): Promise<RuleValidationReport | null> {
    const [row] = await this.db
      .select()
      .from(linterRuleValidationReport)
      .where(eq(linterRuleValidationReport.ruleId, ruleId));
    return row ? rowToReport(row) : null;
  }

  async upsertReport(report: RuleValidationReport): Promise<void> {
    await this.db
      .insert(linterRuleValidationReport)
      .values({
        ruleId: report.ruleId,
        computedAt: report.computedAt,
        precisionHeldOut: report.precisionHeldOut,
        recallHeldOut: report.recallHeldOut,
        f1HeldOut: report.f1HeldOut,
        precisionAdversarial: report.precisionAdversarial,
        heldOutCount: report.heldOutCount,
        adversarialCount: report.adversarialCount,
        blockingEligible: report.blockingEligible,
        thresholdsVersion: report.thresholdsVersion,
      })
      .onConflictDoUpdate({
        target: linterRuleValidationReport.ruleId,
        set: {
          computedAt: report.computedAt,
          precisionHeldOut: report.precisionHeldOut,
          recallHeldOut: report.recallHeldOut,
          f1HeldOut: report.f1HeldOut,
          precisionAdversarial: report.precisionAdversarial,
          heldOutCount: report.heldOutCount,
          adversarialCount: report.adversarialCount,
          blockingEligible: report.blockingEligible,
          thresholdsVersion: report.thresholdsVersion,
        },
      });
  }

  async listReports(): Promise<RuleValidationReport[]> {
    const rows = await this.db
      .select()
      .from(linterRuleValidationReport)
      .orderBy(asc(linterRuleValidationReport.ruleId));
    return rows.map(rowToReport);
  }
}

function rowToCorpusEntry(row: typeof linterValidationCorpus.$inferSelect): CorpusEntry {
  return {
    id: row.id,
    ruleId: row.ruleId,
    chunkId: row.chunkId,
    split: row.split as CorpusSplit,
    expectedVerdict: row.expectedVerdict as ExpectedVerdict,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToReport(row: typeof linterRuleValidationReport.$inferSelect): RuleValidationReport {
  return {
    ruleId: row.ruleId,
    computedAt: row.computedAt,
    precisionHeldOut: row.precisionHeldOut,
    recallHeldOut: row.recallHeldOut,
    f1HeldOut: row.f1HeldOut,
    precisionAdversarial: row.precisionAdversarial,
    heldOutCount: row.heldOutCount,
    adversarialCount: row.adversarialCount,
    blockingEligible: row.blockingEligible,
    thresholdsVersion: row.thresholdsVersion,
  };
}

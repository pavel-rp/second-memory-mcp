/**
 * Tier 2 classifier calibration analysis (NEU-621).
 *
 * Reads hand-labeled chunk verdicts from `scripts/classifier-calibration/labels.csv`,
 * joins against `learning_chunks.validator_report.tier2`, and prints per-field
 * precision/recall/F1 on the calibration vs. OOD splits. Used to decide
 * whether a Tier 2 verdict field is eligible to flip from warning to blocking.
 *
 * Gate (per NEU-621 spec):
 *   - Calibration agreement >= 0.85 AND calibration FP rate < 0.10
 *   - OOD precision >= 0.85
 *
 * The script does NOT mutate any config — it only reports. Operators copy
 * the verdict into `docs/research/YYYY-MM-DD-classifier-calibration.md` and
 * follow the runbook to update `CLASSIFIER_BLOCKING_FIELDS` deploy config.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sql } from 'drizzle-orm';
import { extractExecuteRows, getSql } from '../src/infrastructure/db/operations.js';
import {
  PERSISTED_TIER2_FIELD_NAMES,
} from '../src/shared/prompts/classifier-prompts.js';
import { VERDICT_FIELDS } from '../src/domain/types/classifier.js';

const LABEL_PATH = resolve(process.cwd(), 'scripts', 'classifier-calibration', 'labels.csv');

type Split = 'calibration' | 'ood';
type ExpectedVerdict = 'should_reject' | 'clean' | 'missed';

type LabelRow = {
  chunkId: string;
  field: string;
  split: Split;
  expectedVerdict: ExpectedVerdict;
};

type Tier2Score = {
  score: number | null;
  applicable: boolean | null;
};

type FieldMetrics = {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
};

const BLOCKING_THRESHOLD = 2;

function parseCsv(text: string): LabelRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '' && !l.startsWith('#'));
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(s => s.trim());
  const idxChunk = header.indexOf('chunk_id');
  const idxField = header.indexOf('field');
  const idxSplit = header.indexOf('split');
  const idxVerdict = header.indexOf('expected_verdict');
  if (idxChunk < 0 || idxField < 0 || idxSplit < 0 || idxVerdict < 0) {
    throw new Error(
      `labels.csv missing required columns. Found: ${header.join(', ')}. ` +
        'Expected: chunk_id, field, split, expected_verdict, [notes].'
    );
  }
  const rows: LabelRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(',').map(c => c.trim());
    rows.push({
      chunkId: cols[idxChunk],
      field: cols[idxField],
      split: cols[idxSplit] as Split,
      expectedVerdict: cols[idxVerdict] as ExpectedVerdict,
    });
  }
  return rows;
}

function emptyMetrics(): FieldMetrics {
  return { truePositive: 0, falsePositive: 0, trueNegative: 0, falseNegative: 0 };
}

function precision(m: FieldMetrics): number {
  const denom = m.truePositive + m.falsePositive;
  return denom === 0 ? 0 : m.truePositive / denom;
}

function recall(m: FieldMetrics): number {
  const denom = m.truePositive + m.falseNegative;
  return denom === 0 ? 0 : m.truePositive / denom;
}

function f1(m: FieldMetrics): number {
  const p = precision(m);
  const r = recall(m);
  return p + r === 0 ? 0 : (2 * p * r) / (p + r);
}

function falsePositiveRate(m: FieldMetrics): number {
  const denom = m.falsePositive + m.trueNegative;
  return denom === 0 ? 0 : m.falsePositive / denom;
}

function agreement(m: FieldMetrics): number {
  const total = m.truePositive + m.falsePositive + m.trueNegative + m.falseNegative;
  return total === 0 ? 0 : (m.truePositive + m.trueNegative) / total;
}

async function fetchVerdicts(chunkIds: string[]): Promise<Map<string, Record<string, Tier2Score>>> {
  if (chunkIds.length === 0) return new Map();
  const db = getSql();
  type Row = { id: string; tier2: Record<string, Tier2Score> | null };
  const result = await db.execute<Row>(sql`
    SELECT id, validator_report->'tier2' AS tier2
    FROM learning_chunks
    WHERE id = ANY(${chunkIds})
  `);
  const out = new Map<string, Record<string, Tier2Score>>();
  for (const row of extractExecuteRows<Row>(result)) {
    if (row.tier2) out.set(row.id, row.tier2);
  }
  return out;
}

function classifierPredictsReject(verdict: Tier2Score | undefined): boolean {
  if (verdict === undefined || verdict === null) return false;
  if (verdict.score === null) return false;
  return verdict.score <= BLOCKING_THRESHOLD;
}

function bucketLabel(
  predictReject: boolean,
  expected: ExpectedVerdict,
  metrics: FieldMetrics
): void {
  if (expected === 'should_reject' && predictReject) metrics.truePositive += 1;
  else if (expected === 'should_reject' && !predictReject) metrics.falseNegative += 1;
  else if (expected === 'clean' && predictReject) metrics.falsePositive += 1;
  else if (expected === 'clean' && !predictReject) metrics.trueNegative += 1;
  else if (expected === 'missed' && !predictReject) metrics.falseNegative += 1;
  else if (expected === 'missed' && predictReject) metrics.truePositive += 1;
}

function gateDecision(calibration: FieldMetrics, ood: FieldMetrics): string {
  const calibrationAgreement = agreement(calibration);
  const calibrationFpRate = falsePositiveRate(calibration);
  const oodPrecision = precision(ood);
  const passes =
    calibrationAgreement >= 0.85 && calibrationFpRate < 0.1 && oodPrecision >= 0.85;
  if (passes) return '**flip**';
  if (calibrationAgreement < 0.85 || calibrationFpRate >= 0.1) return 'iterate (calibration miss)';
  if (oodPrecision < 0.85) return 'iterate (OOD overfit)';
  return 'no-go';
}

async function main(): Promise<void> {
  let csvText: string;
  try {
    csvText = readFileSync(LABEL_PATH, 'utf8');
  } catch (err) {
    console.error(`Could not read ${LABEL_PATH}.`);
    console.error('Generate it by following docs/runbooks/classifier-blocking-activation.md.');
    console.error('Inner error:', err);
    process.exit(2);
  }
  const labels = parseCsv(csvText);
  if (labels.length === 0) {
    console.error('No labels in CSV. Aborting.');
    process.exit(2);
  }

  const chunkIds = Array.from(new Set(labels.map(l => l.chunkId)));
  const verdictByChunk = await fetchVerdicts(chunkIds);

  // Per-field metrics keyed by snake-case field name and split.
  const metrics: Record<string, { calibration: FieldMetrics; ood: FieldMetrics }> = {};
  for (const field of VERDICT_FIELDS) {
    metrics[PERSISTED_TIER2_FIELD_NAMES[field]] = {
      calibration: emptyMetrics(),
      ood: emptyMetrics(),
    };
  }

  for (const label of labels) {
    const fieldMetrics = metrics[label.field];
    if (fieldMetrics === undefined) {
      console.warn(`Skipping label for unknown field "${label.field}" (chunk ${label.chunkId}).`);
      continue;
    }
    const tier2 = verdictByChunk.get(label.chunkId);
    if (tier2 === undefined) {
      console.warn(`Skipping label for chunk "${label.chunkId}" — no validator_report.tier2 row.`);
      continue;
    }
    const verdict = tier2[label.field];
    const predict = classifierPredictsReject(verdict);
    const target = label.split === 'calibration' ? fieldMetrics.calibration : fieldMetrics.ood;
    bucketLabel(predict, label.expectedVerdict, target);
  }

  console.log('| Field | Cal n | OOD n | Cal agreement | Cal FP rate | OOD precision | OOD F1 | Decision |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const field of VERDICT_FIELDS) {
    const snake = PERSISTED_TIER2_FIELD_NAMES[field];
    const m = metrics[snake];
    const calN =
      m.calibration.truePositive +
      m.calibration.falsePositive +
      m.calibration.trueNegative +
      m.calibration.falseNegative;
    const oodN =
      m.ood.truePositive + m.ood.falsePositive + m.ood.trueNegative + m.ood.falseNegative;
    const calAgreement = agreement(m.calibration).toFixed(3);
    const calFpRate = falsePositiveRate(m.calibration).toFixed(3);
    const oodPrec = precision(m.ood).toFixed(3);
    const oodF1 = f1(m.ood).toFixed(3);
    const decision = calN === 0 || oodN === 0 ? 'no-go (insufficient data)' : gateDecision(m.calibration, m.ood);
    console.log(`| ${snake} | ${calN} | ${oodN} | ${calAgreement} | ${calFpRate} | ${oodPrec} | ${oodF1} | ${decision} |`);
  }
}

main().catch(err => {
  console.error('classifier-calibration script failed:', err);
  process.exit(1);
});

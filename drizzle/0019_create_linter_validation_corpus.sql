CREATE TABLE infrastructure.linter_validation_corpus (
  id BIGSERIAL PRIMARY KEY,
  rule_id TEXT NOT NULL,
  chunk_id TEXT NOT NULL REFERENCES public.learning_chunks(id) ON DELETE CASCADE,
  split TEXT NOT NULL,
  expected_verdict TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_linter_corpus_split CHECK (split IN ('derivation', 'held_out', 'adversarial_negative', 'random_sample')),
  CONSTRAINT chk_linter_corpus_expected_verdict CHECK (expected_verdict IN ('should_flag', 'clean'))
);

CREATE UNIQUE INDEX uq_linter_validation_corpus_rule_chunk
  ON infrastructure.linter_validation_corpus (rule_id, chunk_id);

CREATE INDEX idx_linter_validation_corpus_rule
  ON infrastructure.linter_validation_corpus (rule_id);

CREATE TABLE infrastructure.linter_rule_validation_report (
  rule_id TEXT PRIMARY KEY,
  computed_at TIMESTAMPTZ NOT NULL,
  precision_held_out REAL,
  recall_held_out REAL,
  f1_held_out REAL,
  precision_adversarial REAL,
  held_out_count INTEGER NOT NULL DEFAULT 0,
  adversarial_count INTEGER NOT NULL DEFAULT 0,
  blocking_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  thresholds_version INTEGER NOT NULL DEFAULT 1
);

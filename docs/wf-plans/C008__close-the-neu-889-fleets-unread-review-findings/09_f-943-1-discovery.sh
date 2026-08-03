#!/bin/sh
# ---------------------------------------------------------------------------
# 09_f-943-1-discovery.sh — the committed, re-runnable discovery for F-943-1.
#
# NEU-954 repaired the C005 DP map (26 wrong `prerequisite_depth` values, 6
# backwards cross-cluster stage orderings, 1 `entry_gate`). This script finds
# every place in `docs/research/` whose text still depends on the pre-repair
# state, so that each hit can be classified live / generated / historical and
# treated by its class.
#
# WHY A SCRIPT AND NOT A LIST
#   Three successive charter revisions each hand-enumerated F-943-1's binding
#   sites, and each enumeration was found incomplete by the next review. The
#   instances differed every time; the class did not. So the scope of the
#   repair is THIS SEARCH, re-run, and not any table of file names. A reader
#   re-runs this script and gets the same hit set.
#
# THE THREE LIMBS — each is independently required
#
#   LIMB 1 — THE FINDING IDS. `F-943-1` and `F-943-3` written literally.
#     Catches registers, ledgers, gates and generator literals that name the
#     finding. This is the limb every previous enumeration used.
#
#   LIMB 2 — THE CORRECTED VALUES. The dimension fields and their value
#     vocabulary (`prerequisite_depth`, `progression_stage`, `entry_gate`,
#     `PS-0`..`PS-4`, `gate-a`..`gate-e`, depth literals in prose). Catches a
#     document that RESTATES a node's dimension values instead of deriving
#     them — a restatement goes stale silently when the map is recomputed.
#     The map's own node YAML files match here too; they are the source of the
#     values, not a restatement, and they are `settled` (a manifest-declared
#     class that changes only through a ledger entry, never a local edit), so
#     they are recorded and left alone.
#
#   LIMB 3 — THE DERIVED STATISTICS. The stage distribution, the PS-4 share,
#     the depth range and histogram, the entry-gate counts, and the
#     affected-node counts.
#
# WHY LIMB 3 IS NOT COVERED BY LIMB 1
#   A statistic computed FROM the repaired values does not have to mention the
#   finding that repaired them. The canonical proof case is
#   `docs/research/C005-dp-progression/01_progression-stages.md`, which states
#   "Observed distribution ... PS-1 20 · PS-2 32 · PS-3 36 · PS-4 91",
#   "PS-4 holds 51% of the graph" and "The depth range is 1-9" while
#   containing ZERO occurrences of `F-943-`. An id-only search returns nothing
#   for that file. That is exactly how it survived three enumerations. Limb 3
#   exists to reach files that cite no finding id at all.
#
# CONTRACT
#   * Run from the repository root:  sh docs/wf-plans/C008__.../09_f-943-1-discovery.sh
#   * Output is deterministic: sorted, no timestamps, no absolute paths, no
#     host-specific text. Two runs are byte-identical.
#   * Every raw hit is printed as `path:line: <matched text>`.
#   * The COMBINED HIT TABLE de-duplicates raw occurrences into SITES. A site
#     is one (file, pattern) pair: the same claim shape repeated N times in one
#     file (e.g. the generated view re-emits one F-943-3 sentence on all 179
#     dimension-bearing blocks) is one site with N occurrences, because it has
#     one classification and one treatment. Every line number is listed, so no
#     occurrence is hidden. THE TOTAL HIT COUNT IS THE SITE COUNT, and the
#     classification record carries exactly one row per site.
#   * Tools used: grep, sort, sed, awk, wc. No jq, no python, no date.
# ---------------------------------------------------------------------------

set -u

LC_ALL=C
export LC_ALL

ROOT="docs/research"

if [ ! -d "$ROOT" ]; then
  echo "ERROR: run this script from the repository root ($ROOT not found)" >&2
  exit 2
fi

WORK=".tmp/f-943-1-discovery"
rm -rf "$WORK"
mkdir -p "$WORK"
ALL="$WORK/all.tsv"
: > "$ALL"

# run_pattern <limb> <pattern-id> <description> <ERE>
run_pattern() {
  _limb="$1"
  _pid="$2"
  _desc="$3"
  _re="$4"

  echo "--- $_pid — $_desc"
  _raw="$WORK/$_pid.raw"
  grep -rnE -- "$_re" "$ROOT" > "$_raw" 2>/dev/null
  sort -t: -k1,1 -k2,2n "$_raw" > "$_raw.sorted"
  sed -E 's/^([^:]+):([0-9]+):[[:space:]]*/\1:\2: /' "$_raw.sorted" \
    | sed -E 's/[[:space:]]+$//'
  _n=$(wc -l < "$_raw.sorted" | sed -E 's/[[:space:]]//g')
  echo "    ($_pid: $_n occurrence(s))"
  echo ""

  awk -v limb="$_limb" -v pid="$_pid" -F: '
    { line = $2; path = $1
      txt = $0
      sub(/^[^:]+:[0-9]+:[[:space:]]*/, "", txt)
      gsub(/\t/, " ", txt)
      printf "%s\t%s\t%s\t%s\t%s\n", limb, pid, path, line, txt }
  ' "$_raw.sorted" >> "$ALL"
}

echo "==========================================================================="
echo "F-943-1 DISCOVERY — three-limb search over $ROOT"
echo "==========================================================================="
echo ""
echo "Limb 1 = the finding ids. Limb 2 = the corrected dimension values."
echo "Limb 3 = the statistics derived from those values."
echo "Limb 3 is NOT covered by limb 1: a derived statistic need not name the"
echo "finding, and the longest-surviving miss was exactly that shape."
echo ""

echo "==========================================================================="
echo "LIMB 1 — THE FINDING IDS"
echo "==========================================================================="
echo ""
run_pattern 1 "L1-id1" "literal F-943-1" 'F-943-1'
run_pattern 1 "L1-id3" "literal F-943-3" 'F-943-3'

echo "==========================================================================="
echo "LIMB 2 — THE CORRECTED VALUES (restatements of node dimension values)"
echo "==========================================================================="
echo ""
run_pattern 2 "L2-depth-field" "the prerequisite_depth field" 'prerequisite_depth'
run_pattern 2 "L2-stage-field" "the progression_stage field" 'progression_stage'
run_pattern 2 "L2-gate-field" "the entry_gate field" 'entry_gate'
run_pattern 2 "L2-stage-value" "a PS-0..PS-4 stage value" 'PS-[0-4]'
run_pattern 2 "L2-gate-value" "a gate-a..gate-e entry-gate value" 'gate-[a-e]'
run_pattern 2 "L2-depth-literal" "a depth literal in prose" '[Dd]epths?[[:space:]]+(of[[:space:]]+|is[[:space:]]+|=[[:space:]]*|==[[:space:]]*)?[0-9]|[Rr]ubric depth|[Dd]eclared depth|depth[[:space:]]*[:=][[:space:]]*[0-9]'

echo "==========================================================================="
echo "LIMB 3 — THE DERIVED STATISTICS"
echo "==========================================================================="
echo ""
run_pattern 3 "L3-stage-dist" "a stage distribution or stage-count tuple" 'Observed distribution|stage distribution|PS-[0-4][^A-Za-z0-9]{1,3}[0-9]+|[0-9]+[[:space:]]+PS-[0-4]'
run_pattern 3 "L3-ps4-share" "the PS-4 share of the graph" 'PS-4 holds|[0-9]+% of the graph|holds [0-9]+%'
run_pattern 3 "L3-depth-range" "the depth range or histogram" 'depth range|depth histogram|range is [0-9]+.?[0-9]+'
run_pattern 3 "L3-gate-counts" "entry-gate counts and the gate distribution" 'gate distribution|gate-[a-e][^A-Za-z0-9]{0,6}(×|x)[0-9]+|(×|x)(19|20|159|160)([^0-9]|$)|gate-[a-e][^|]{0,24}[0-9]+ (nodes|of the)'
run_pattern 3 "L3-affected-counts" "affected-node, inversion and map-size counts" '26 of 179|26 [^.]{0,40}(depth|prerequisite_depth)|[0-9]+ depth mismatch|[0-9]+ stage inversion|[0-9]+ (dependencies|dependency edges) [^.]{0,20}(backwards|invert)|179 [^.]{0,30}nodes|zero exceptions'
run_pattern 3 "L3-uninstantiated" "the uninstantiated-gate claim" 'instantiated by no node|uninstantiated|Gates? [BD]( and [BD])? '

echo "==========================================================================="
echo "COMBINED HIT TABLE — de-duplicated to SITES"
echo "==========================================================================="
echo ""
echo "One row per site. A site is one (file, pattern) pair; repeated identical"
echo "claim shapes inside one file collapse to one site with every line number"
echo "listed, because they share one classification and one treatment."
echo ""
echo "site# | path | limb(s) | pattern(s) | occ | line(s) | first matched text"
echo "---------------------------------------------------------------------------"

awk -F'\t' '
  {
    limb = $1; pid = $2; path = $3; line = $4; txt = $5
    key = path "\t" pid
    if (!(key in seen)) {
      seen[key] = 1
      order[++k] = key
      klimb[key] = limb
      if (length(txt) > 150) txt = substr(txt, 1, 150) " [...]"
      kfirst[key] = txt
      klines[key] = line
      kcount[key] = 1
    } else {
      kcount[key]++
      if (kcount[key] <= 10) klines[key] = klines[key] "," line
    }
  }
  END {
    for (i = 1; i <= k; i++) {
      key = order[i]
      split(key, kk, "\t")
      lines = klines[key]
      if (kcount[key] > 10) lines = lines ",+" (kcount[key] - 10) " more"
      print kk[1] "\t" klimb[key] "\t" kk[2] "\t" kcount[key] "\t" lines "\t" kfirst[key]
    }
  }
' "$ALL" > "$WORK/sites.tsv"

sort -t'	' -k1,1 -k3,3 "$WORK/sites.tsv" > "$WORK/sites.sorted.tsv"

awk -F'\t' '{ print NR " | " $1 " | L" $2 " | " $3 " | " $4 " | " $5 " | " $6 }' \
  "$WORK/sites.sorted.tsv"

echo ""
echo "==========================================================================="
echo "TOTALS"
echo "==========================================================================="
echo ""

TOTAL_RAW=$(wc -l < "$ALL" | sed -E 's/[[:space:]]//g')
TOTAL_SITES=$(wc -l < "$WORK/sites.sorted.tsv" | sed -E 's/[[:space:]]//g')

echo "raw occurrences (all limbs, all patterns): $TOTAL_RAW"
echo "TOTAL HIT COUNT (de-duplicated sites):     $TOTAL_SITES"
echo ""
echo "--- sites per limb ---"
awk -F'\t' '{ c[$2]++ } END { for (l in c) printf "limb %s: %d site(s)\n", l, c[l] }' \
  "$WORK/sites.sorted.tsv" | sort
echo ""
echo "--- sites per file ---"
awk -F'\t' '{ c[$1]++ } END { for (p in c) printf "%s: %d site(s)\n", p, c[p] }' \
  "$WORK/sites.sorted.tsv" | sort
echo ""
echo "--- files reached, by limb ---"
awk -F'\t' '{ key = $2 "\t" $1; if (!(key in s)) { s[key] = 1; print key } }' \
  "$WORK/sites.sorted.tsv" | sort | awk -F'\t' '{ printf "limb %s: %s\n", $1, $2 }'
echo ""
echo "--- files reached by limb 3 but NOT by limb 1 (the id-grep blind spot) ---"
awk -F'\t' '{ if ($2 == 1) one[$1] = 1; if ($2 == 3) three[$1] = 1 }
  END { for (p in three) if (!(p in one)) print p }' \
  "$WORK/sites.sorted.tsv" | sort
echo ""
echo "==========================================================================="
echo "END OF DISCOVERY"
echo "==========================================================================="

rm -rf "$WORK"

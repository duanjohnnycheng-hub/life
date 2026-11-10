import { counterfactualSentence, drawCore, drawParallels, type DrawOptions } from "@/lib/lottery";
import { composeChapters, epitaph } from "@/lib/narrative";
import { freshSeed, mulberry32 } from "@/lib/rng";
import type { LifeRecord, PoolId, Scale } from "@/lib/types";

export function createLife(pool: PoolId, scale: Scale, speciesId?: string): LifeRecord {
  const seed = freshSeed();
  const rng = mulberry32(seed);
  const options: DrawOptions = { pool, scale, rng, speciesId };
  const core = drawCore(options);
  const chapters = composeChapters(core.being, core.threat.label, core.early, core.livedLabel, core.human, rng);
  return {
    id: `L-${seed.toString(36)}`,
    seed,
    pool,
    scale,
    forced: Boolean(speciesId),
    being: core.being,
    livedLabel: core.livedLabel,
    early: core.early,
    chapters,
    deathCause: core.threat.label,
    epitaph: epitaph(core.being, core.livedLabel, core.threat.label),
    oddsTrue: core.oddsTrue,
    oddsNote: core.oddsNote,
    humanOdds: core.humanOdds,
    counterfactual: core.counterfactual ? counterfactualSentence(core.counterfactual) : null,
    parallels: drawParallels(pool, scale, rng),
    createdAt: Date.now(),
    chapterIndex: 0,
    choiceId: null,
    note: "",
    archived: false,
  };
}

import { COUNTRIES, type Country } from "@/data/countries";
import { GROUPS, SPECIES, type GroupDef, type SpeciesDef } from "@/data/catalog";
import { formatSpan, oddsPhrase, percentLabel } from "@/lib/format";
import { pick, pickWeighted, type Rng } from "@/lib/rng";
import {
  KINGDOM_LABEL,
  KINGDOMS,
  inPool,
  poolLabel,
  scaleLabel,
  type AtlasRow,
  type Being,
  type Glimpse,
  type HumanFacts,
  type Kingdom,
  type PoolId,
  type Scale,
  type SexMode,
  type Threat,
} from "@/lib/types";

type Entry = {
  id: string;
  kind: "species" | "group";
  kingdom: Kingdom;
  clade: SpeciesDef["clade"];
  individuals: number;
  atlas: AtlasRow;
  build: (rng: Rng) => Omit<Being, "place" | "sex"> & { places: string[]; sexes: SexMode };
};

function rollSex(mode: SexMode, rng: Rng): string | null {
  if (mode === "none") return null;
  if (mode === "plant") return rng() < 0.5 ? "雌株" : "雄株";
  return rng() < 0.5 ? "雌性" : "雄性";
}

function fromSpecies(species: SpeciesDef): Entry {
  return {
    id: species.id,
    kind: "species",
    kingdom: species.kingdom,
    clade: species.clade,
    individuals: species.individuals,
    atlas: {
      id: species.id,
      kind: "species",
      nameZh: species.nameZh,
      nameLa: species.nameLa,
      kingdom: species.kingdom,
      clade: species.clade,
      group: species.group,
      individuals: species.individuals,
      note: species.note,
      named: true,
    },
    build: (_rng) => ({
      id: species.id,
      catalogId: species.id,
      nameZh: species.nameZh,
      nameLa: species.nameLa,
      kingdom: species.kingdom,
      clade: species.clade,
      group: species.group,
      individuals: species.individuals,
      mass: species.individuals,
      named: true,
      lifespan: species.lifespan,
      lifespanDays: species.lifespanDays,
      diet: species.diet,
      body: species.voice,
      sense: species.sense,
      reproduction: species.reproduction,
      threats: species.threats,
      narrative: species.narrative,
      note: species.note,
      voice: species.voice,
      places: species.places,
      sexes: species.sexes,
    }),
  };
}

function fromGroup(group: GroupDef): Entry {
  return {
    id: group.id,
    kind: "group",
    kingdom: group.kingdom,
    clade: group.clade,
    individuals: group.individuals,
    atlas: {
      id: group.id,
      kind: "group",
      nameZh: group.title,
      nameLa: group.nameLaStem,
      kingdom: group.kingdom,
      clade: group.clade,
      group: group.group,
      individuals: group.individuals,
      note: group.note,
      named: false,
    },
    build: (rng) => {
      const shape = pick(group.shapes, rng);
      const diet = pick(group.diets, rng);
      const code = 10000 + Math.floor(rng() * 90000);
      return {
        id: `${group.id}-${code}`,
        catalogId: group.id,
        nameZh: `一种${shape}`,
        nameLa: `${group.nameLaStem} sp. ${code}`,
        kingdom: group.kingdom,
        clade: group.clade,
        group: group.group,
        individuals: null,
        mass: group.individuals,
        named: false,
        lifespan: group.lifespan,
        lifespanDays: group.lifespanDays,
        diet,
        body: `${group.voice}这一次，你是${shape}，靠${diet}为生。`,
        sense: group.sense,
        reproduction: group.reproduction,
        threats: group.threats,
        narrative: group.narrative,
        note: group.note,
        voice: `${group.voice}这一次，你是${shape}，靠${diet}为生。`,
        places: group.places,
        sexes: group.sexes,
      };
    },
  };
}

const ENTRIES: Entry[] = [...GROUPS.map(fromGroup), ...SPECIES.map(fromSpecies)];

export function atlasRows(): AtlasRow[] {
  return ENTRIES.map((entry) => entry.atlas);
}

export function entryWeight(individuals: number, scale: Scale): number {
  if (scale === "log") return Math.max(1, Math.log10(Math.max(individuals, 10)));
  return individuals;
}

function poolEntries(pool: PoolId): Entry[] {
  return ENTRIES.filter((entry) => inPool(pool, entry.kingdom, entry.clade));
}

export type PoolStats = {
  total: number;
  humanP: number;
  byKingdom: { kingdom: Kingdom; label: string; n: number; p: number }[];
  dominantLabel: string;
  dominantP: number;
};

export function poolStats(pool: PoolId, scale: Scale = "count"): PoolStats {
  const entries = poolEntries(pool);
  const total = entries.reduce((sum, entry) => sum + entryWeight(entry.individuals, scale), 0);
  const human = entries.find((entry) => entry.id === "homo-sapiens");
  const humanP = human && total > 0 ? entryWeight(human.individuals, scale) / total : 0;
  const byKingdom = KINGDOMS.map((kingdom) => {
    const n = entries
      .filter((entry) => entry.kingdom === kingdom)
      .reduce((sum, entry) => sum + entryWeight(entry.individuals, scale), 0);
    return { kingdom, label: KINGDOM_LABEL[kingdom], n, p: total > 0 ? n / total : 0 };
  }).filter((row) => row.n > 0);
  const dominant = byKingdom.reduce((best, row) => (row.p > best.p ? row : best), byKingdom[0]!);
  return {
    total,
    humanP,
    byKingdom,
    dominantLabel: dominant?.label ?? "—",
    dominantP: dominant?.p ?? 0,
  };
}

export function trueOdds(entryId: string, pool: PoolId): number {
  const entries = poolEntries(pool);
  const total = entries.reduce((sum, entry) => sum + entry.individuals, 0);
  const entry = entries.find((item) => item.id === entryId);
  if (!entry || total <= 0) return 0;
  return entry.individuals / total;
}

function pickThreat(threats: Threat[], rng: Rng): Threat {
  return pickWeighted(threats, (item) => item.p, rng);
}

export function rollHuman(rng: Rng): HumanFacts {
  const country: Country = pickWeighted(COUNTRIES, (item) => item.births, rng);
  const male = rng() < 0.512;
  const sex = male ? "男" : "女";
  const le = male ? country.leM : country.leF;
  const underFive = country.income === "low" ? 0.075 : country.income === "mid" ? 0.018 : 0.0045;
  let age: number;
  if (rng() < underFive) {
    age = rng() < 0.55 ? 0 : 1 + Math.floor(rng() * 4);
  } else {
    const z = rng() + rng() + rng() + rng() + rng() + rng() - 3;
    const normal = z / Math.sqrt(0.5);
    age = Math.round(le + normal * 11);
    age = Math.max(5, Math.min(104, age));
  }
  return { country: country.name, setting: country.setting, sex, income: country.income, age, le };
}

export function humanCause(facts: HumanFacts, rng: Rng): string {
  const { age, income, sex } = facts;
  if (age < 1) {
    return pick(income === "high" ? ["出生前后的并发症", "先天的疾病"] : ["出生前后的并发症", "感染", "早产之后没有稳住"], rng);
  }
  if (age < 5) {
    return pick(income === "low" ? ["感染", "腹泻造成的脱水", "疟疾"] : ["感染", "意外", "先天的疾病"], rng);
  }
  if (age < 15) return pick(["感染", "意外", "急性的疾病"], rng);
  if (sex === "女" && age >= 15 && age <= 45 && income !== "high" && rng() < (income === "low" ? 0.08 : 0.015)) {
    return "分娩前后的并发症";
  }
  if (age < 50) {
    return pick(
      income === "low" ? ["感染", "意外", "他人造成的伤害", "心脑血管疾病"] : ["意外", "肿瘤", "心脑血管疾病", "感染"],
      rng,
    );
  }
  return pick(["心脑血管疾病", "肿瘤", "呼吸道疾病", "一次跌倒之后没有再恢复"], rng);
}

function materialize(entry: Entry, rng: Rng): Being {
  const built = entry.build(rng);
  const place = pick(built.places, rng);
  const sex = rollSex(built.sexes, rng);
  return {
    id: built.id,
    catalogId: built.catalogId,
    nameZh: built.nameZh,
    nameLa: built.nameLa,
    kingdom: built.kingdom,
    clade: built.clade,
    group: built.group,
    place,
    individuals: built.individuals,
    mass: built.mass,
    named: built.named,
    lifespan: built.lifespan,
    lifespanDays: built.lifespanDays,
    diet: built.diet,
    body: built.body,
    sense: built.sense,
    reproduction: built.reproduction,
    threats: built.threats,
    narrative: built.narrative,
    note: built.note,
    voice: built.voice,
    sex,
  };
}

export type DrawOptions = {
  pool: PoolId;
  scale: Scale;
  rng: Rng;
  speciesId?: string;
};

export type DrawCore = {
  being: Being;
  threat: Threat;
  livedLabel: string;
  early: boolean;
  human: HumanFacts | null;
  counterfactual: HumanFacts | null;
  oddsTrue: string;
  oddsNote: string;
  humanOdds: string;
};

export function drawCore(options: DrawOptions): DrawCore {
  const entries = poolEntries(options.pool);
  const forced = options.speciesId ? ENTRIES.find((entry) => entry.id === options.speciesId) : undefined;
  const entry =
    forced ??
    pickWeighted(entries, (item) => entryWeight(item.individuals, options.scale), options.rng);
  let being = materialize(entry, options.rng);
  const human = being.narrative === "human" ? rollHuman(options.rng) : null;
  if (human) {
    being = {
      ...being,
      place: `${human.country} · ${human.setting}`,
      sex: human.sex === "女" ? "女性" : "男性",
    };
  }
  const threat = being.narrative === "human" && human ? { label: humanCause(human, options.rng), p: 1, early: human.age < 5 } : pickThreat(being.threats, options.rng);
  const early = being.narrative === "human" ? Boolean(human && human.age < 15 && threat.early) : Boolean(threat.early);
  let livedLabel: string;
  if (human) {
    livedLabel = human.age <= 0 ? "未满一岁" : `${human.age} 岁`;
  } else {
    const factor = early ? 0.08 + options.rng() * 0.28 : 0.55 + options.rng() * 0.9;
    livedLabel = formatSpan(Math.max(0.04, being.lifespanDays * factor));
  }
  const inThisPool = entries.some((item) => item.id === entry.id);
  const p = inThisPool ? trueOdds(entry.id, options.pool) : 0;
  const oddsTrue = !inThisPool
    ? `它不在「${poolLabel(options.pool)}」里。若改到「全部个体」，按真实数量抽中它是${oddsPhrase(trueOdds(entry.id, "all"))}。这次是指定出生。`
    : being.named
      ? `按真实数量，在「${poolLabel(options.pool)}」里抽中${being.nameZh}是${oddsPhrase(p)}。`
      : `你属于「${entry.atlas.nameZh}」。这个类群在「${poolLabel(options.pool)}」的真实数量里约占 ${percentLabel(p)}。类群之内没有种名，没法写成某一种的几分之一。`;
  const oddsNote =
    options.speciesId
      ? "这是从图鉴指定的出生，不是随机抽签。"
      : options.scale === "log"
        ? "这次用了数量级刻度：权重是个体数的对数，所以稀有物种会现身。上面的概率仍是真实数量，不是这次按钮使用的权重。"
        : "这次按真实个体数量抽取。特别稀少的物种几乎不会被点到，它们在图鉴里，可以指定出生。";
  const stats = poolStats(options.pool, "count");
  const humanOdds =
    stats.humanP > 0
      ? `同一范围内成为智人的真实概率是${oddsPhrase(stats.humanP)}。`
      : "这个范围里没有智人。";
  const counterfactual = human ? null : rollHuman(options.rng);
  return { being, threat, livedLabel, early, human, counterfactual, oddsTrue, oddsNote, humanOdds };
}

export function glimpseLine(being: Being, threatLabel: string): string {
  return `${being.voice} 常见的结局之一是：${threatLabel}。`;
}

export function drawParallels(pool: PoolId, scale: Scale, rng: Rng): Glimpse[] {
  const list: Glimpse[] = [];
  for (let index = 0; index < 4; index += 1) {
    const core = drawCore({ pool, scale, rng });
    list.push({
      nameZh: core.being.nameZh,
      nameLa: core.being.nameLa,
      place: core.being.place,
      kingdom: KINGDOM_LABEL[core.being.kingdom],
      line: `${core.being.named ? core.being.note : "它没有正式种名。"} 结局多半归在「${core.threat.label}」。`,
    });
  }
  return list;
}

export function counterfactualSentence(facts: HumanFacts): string {
  const sex = facts.sex === "女" ? "女孩" : "男孩";
  return `若这次只在人类的新生儿里抽签，你大概会是${facts.country}的一名${sex}，生活在${facts.setting}。那次抽签没有发生。`;
}

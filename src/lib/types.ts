export const KINGDOMS = ["bacteria", "archaea", "protist", "fungi", "plant", "animal"] as const;
export type Kingdom = (typeof KINGDOMS)[number];

export const KINGDOM_LABEL: Record<Kingdom, string> = {
  bacteria: "细菌",
  archaea: "古菌",
  protist: "原生生物",
  fungi: "真菌",
  plant: "植物",
  animal: "动物",
};

export type Clade =
  | "bacteria"
  | "archaea"
  | "protist"
  | "fungi"
  | "plant"
  | "invertebrate"
  | "fish"
  | "bird"
  | "reptile"
  | "amphibian"
  | "mammal";

export type NarrativeKind = "microbe" | "plant" | "fungus" | "invertebrate" | "vertebrate" | "human";

export type SexMode = "none" | "binary" | "plant";

export type Scale = "count" | "log";

export const POOLS = [
  {
    id: "all",
    label: "全部个体",
    detail: "从细菌到蓝鲸，按估计的个体数量放进同一口签。",
  },
  {
    id: "eukaryote",
    label: "真核生物",
    detail: "有细胞核的生命。细菌与古菌不参加。",
  },
  {
    id: "animal",
    label: "动物",
    detail: "线虫、昆虫、鱼、鸟、兽。仍按只数，不按名气。",
  },
  {
    id: "vertebrate",
    label: "脊椎动物",
    detail: "鱼、两栖类、爬行类、鸟和哺乳动物。",
  },
  {
    id: "mammal",
    label: "哺乳动物",
    detail: "鼠、人、家畜，以及所剩不多的野生兽类。",
  },
] as const;

export type PoolId = (typeof POOLS)[number]["id"];

export type Threat = { label: string; p: number; early?: boolean };

export type Being = {
  id: string;
  catalogId: string;
  nameZh: string;
  nameLa: string;
  kingdom: Kingdom;
  clade: Clade;
  group: string;
  place: string;
  individuals: number | null;
  mass: number;
  named: boolean;
  lifespan: string;
  lifespanDays: number;
  diet: string;
  body: string;
  sense: string;
  reproduction: string;
  threats: Threat[];
  narrative: NarrativeKind;
  note: string;
  voice: string;
  sex: string | null;
};

export type Chapter = {
  phase: string;
  title: string;
  when: string;
  text: string[];
  choice?: {
    prompt: string;
    options: { id: string; label: string; memory: string }[];
  };
};

export type Glimpse = {
  nameZh: string;
  nameLa: string;
  place: string;
  kingdom: string;
  line: string;
};

export type HumanFacts = {
  country: string;
  setting: string;
  sex: "女" | "男";
  income: "low" | "mid" | "high";
  age: number;
  le: number;
};

export type LifeRecord = {
  id: string;
  seed: number;
  pool: PoolId;
  scale: Scale;
  forced: boolean;
  being: Being;
  livedLabel: string;
  early: boolean;
  chapters: Chapter[];
  deathCause: string;
  epitaph: string;
  oddsTrue: string;
  oddsNote: string;
  humanOdds: string;
  counterfactual: string | null;
  parallels: Glimpse[];
  createdAt: number;
  chapterIndex: number;
  choiceId: string | null;
  note: string;
  archived: boolean;
};

export type AtlasRow = {
  id: string;
  kind: "species" | "group";
  nameZh: string;
  nameLa: string;
  kingdom: Kingdom;
  clade: Clade;
  group: string;
  individuals: number;
  note: string;
  named: boolean;
};

export function inPool(pool: PoolId, kingdom: Kingdom, clade: Clade): boolean {
  if (pool === "all") return true;
  if (pool === "eukaryote") return kingdom !== "bacteria" && kingdom !== "archaea";
  if (pool === "animal") return kingdom === "animal";
  if (pool === "vertebrate") return clade === "fish" || clade === "bird" || clade === "reptile" || clade === "amphibian" || clade === "mammal";
  return clade === "mammal";
}

export function poolLabel(pool: PoolId): string {
  return POOLS.find((item) => item.id === pool)?.label ?? pool;
}

export function scaleLabel(scale: Scale): string {
  return scale === "count" ? "真实数量" : "数量级";
}

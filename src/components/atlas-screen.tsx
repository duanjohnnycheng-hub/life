import { useMemo, useState } from "react";
import { atlasRows, trueOdds } from "@/lib/lottery";
import { oddsPhrase, sci } from "@/lib/format";
import { KINGDOM_LABEL, KINGDOMS, poolLabel, type Kingdom, type PoolId, type Scale } from "@/lib/types";

export function AtlasScreen({
  pool,
  scale,
  onBorn,
}: {
  pool: PoolId;
  scale: Scale;
  onBorn: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [kingdom, setKingdom] = useState<Kingdom | "all">("all");
  const [namedOnly, setNamedOnly] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return atlasRows()
      .filter((row) => (namedOnly ? row.named : true))
      .filter((row) => (kingdom === "all" ? true : row.kingdom === kingdom))
      .filter((row) => {
        if (!needle) return true;
        return `${row.nameZh} ${row.nameLa} ${row.note}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => b.individuals - a.individuals);
  }, [query, kingdom, namedOnly]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <h1 className="font-serif text-4xl">图鉴</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        有名字的物种可以指定出生。没有名字的类群代表地球上尚未被逐种清点的大多数。指定不是随机，页面会写明。当前范围是「{poolLabel(pool)}」，刻度是「{scale === "count" ? "真实数量" : "数量级"}」，指定时仍会显示真实概率。
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索中文或拉丁名"
          className="min-h-12 rounded-full border border-line bg-surface px-4 text-sm text-fg placeholder:text-faint"
          aria-label="搜索物种"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip active={namedOnly} onClick={() => setNamedOnly(true)} label="有学名" />
          <FilterChip active={!namedOnly} onClick={() => setNamedOnly(false)} label="包含未命名类群" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={kingdom === "all"} onClick={() => setKingdom("all")} label="全部界" />
          {KINGDOMS.map((item) => (
            <FilterChip key={item} active={kingdom === item} onClick={() => setKingdom(item)} label={KINGDOM_LABEL[item]} />
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-faint">{rows.length} 条</p>
      <ul className="mt-2 divide-y divide-line">
        {rows.map((row) => {
          const expanded = open === row.id;
          const odds = trueOdds(row.id, pool);
          return (
            <li key={row.id} className="py-4">
              <button type="button" onClick={() => setOpen(expanded ? null : row.id)} className="w-full text-left">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-base text-fg">{row.nameZh}</span>
                  <span className="shrink-0 text-xs text-faint">{sci(row.individuals)}</span>
                </span>
                <span className="mt-1 block text-xs italic text-faint">{row.nameLa}</span>
                <span className="mt-1 block text-xs text-muted">
                  {KINGDOM_LABEL[row.kingdom]} · {row.group}
                </span>
              </button>
              {expanded ? (
                <div className="mt-3">
                  <p className="text-sm leading-relaxed text-muted">{row.note}</p>
                  <p className="mt-2 text-sm text-muted">
                    {odds > 0
                      ? `在「${poolLabel(pool)}」的真实数量里，${row.named ? `抽中它是${oddsPhrase(odds)}` : `这个类群约占 ${oddsPhrase(odds)}`}。`
                      : `「${poolLabel(pool)}」的随机抽签不包含它。仍可以指定出生。`}
                  </p>
                  <button
                    type="button"
                    onClick={() => onBorn(row.id)}
                    className="mt-3 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-ink"
                  >
                    {row.named ? "指定成为它" : "出生为这类群中的一个"}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={"min-h-10 shrink-0 rounded-full border px-3 text-sm " + (active ? "border-accent text-accent" : "border-line text-muted")}
    >
      {label}
    </button>
  );
}

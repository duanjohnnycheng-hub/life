import { poolStats } from "@/lib/lottery";
import { percentLabel, sci } from "@/lib/format";
import { POOLS, type PoolId, type Scale } from "@/lib/types";

const BIRTHS_PER_SEC = 4.2;
const DEATHS_PER_SEC = 1.8;

export function HomeScreen({
  pool,
  scale,
  births,
  deaths,
  onPool,
  onScale,
  onBorn,
}: {
  pool: PoolId;
  scale: Scale;
  births: number;
  deaths: number;
  onPool: (pool: PoolId) => void;
  onScale: (scale: Scale) => void;
  onBorn: () => void;
}) {
  const stats = poolStats(pool, "count");
  const maxLog = Math.max(...stats.byKingdom.map((row) => Math.log10(row.n)));

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-8 md:px-8 md:pt-16">
      <section className="grid items-end gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-sm tracking-[0.18em] text-accent">地球上的一口签</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-fg md:text-7xl">你会出生成谁</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            大约每秒有四个人类婴儿出生。若把细菌、线虫、硅藻和树也算进「活着的个体」，人只是一条几乎看不见的缝。你不能选择身体。和当初一样。
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-faint">
            走完这一生大约几分钟。死亡按该类群真实的风险到来，不描写场面。数量是数量级，不是普查。
          </p>
        </div>
        <aside className="md:col-span-5">
          <div className="rounded-2xl border border-line bg-surface/80 p-5">
            <p className="text-sm text-faint">打开这个页面之后，只数人类</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-serif text-4xl text-fg">{Math.floor(births).toLocaleString("zh-Hans")}</p>
                <p className="mt-1 text-sm text-muted">诞生的婴儿</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-fg">{Math.floor(deaths).toLocaleString("zh-Hans")}</p>
                <p className="mt-1 text-sm text-muted">离开的人</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-faint">
              按每年约 1.3 亿次出生、约 6 千万次死亡粗算，每秒 {BIRTHS_PER_SEC} 与 {DEATHS_PER_SEC}。只为感受节奏，不是实时登记。其余生命的生死太快，无法用整数诚实地跳动。
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="font-serif text-2xl">这一口签里有什么</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            在「{POOLS.find((item) => item.id === pool)?.label}」的真实数量里，{stats.dominantLabel}约占 {percentLabel(stats.dominantP)}。
            {stats.humanP > 0 ? `成为智人的概率是${percentLabel(stats.humanP)}。` : "这个范围里没有智人。"}
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-2" title="按真实数量">
            <div className="flex h-full">
              {stats.byKingdom.map((row) => (
                <div
                  key={row.kingdom}
                  className="h-full bg-accent"
                  style={{ width: `${Math.max(row.p * 100, 0)}%`, opacity: 0.35 + row.p * 0.65 }}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-faint">上面这条按真实数量。稀有的界通常没有宽度。</p>
          <ul className="mt-5 space-y-2">
            {stats.byKingdom.map((row) => (
              <li key={row.kingdom} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="text-muted">{row.label}</span>
                <span className="h-1.5 rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${(Math.log10(row.n) / maxLog) * 100}%` }}
                  />
                </span>
                <span className="text-xs text-faint">{sci(row.n)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-faint">下面这些条取了对数，只为让植物和动物看得见。</p>
        </div>

        <form
          className="md:col-span-7"
          onSubmit={(event) => {
            event.preventDefault();
            onBorn();
          }}
        >
          <fieldset>
            <legend className="font-serif text-2xl">出生的范围</legend>
            <div className="mt-4 grid gap-2">
              {POOLS.map((item) => {
                const active = pool === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onPool(item.id)}
                    className={
                      "rounded-2xl border px-4 py-3 text-left transition " +
                      (active ? "border-accent bg-surface-2" : "border-line bg-surface/50 hover:border-muted")
                    }
                  >
                    <span className="block text-base text-fg">{item.label}</span>
                    <span className="mt-1 block text-sm text-muted">{item.detail}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm text-muted">抽签刻度</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["count", "真实数量", "你会不断成为微生物。这是诚实的结果。"],
                  ["log", "数量级", "稀有物种会现身。概率不再等于个体比例。"],
                ] as const
              ).map(([id, label, detail]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={scale === id}
                  onClick={() => onScale(id)}
                  className={
                    "min-h-20 rounded-2xl border px-3 py-3 text-left " +
                    (scale === id ? "border-accent bg-surface-2" : "border-line hover:border-muted")
                  }
                >
                  <span className="block text-sm text-fg">{label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-faint">{detail}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-base font-medium text-accent-ink md:w-auto">
            {scale === "count" ? "按真实数量出生" : "按数量级出生"}
          </button>
        </form>
      </section>
    </div>
  );
}

export { BIRTHS_PER_SEC, DEATHS_PER_SEC };

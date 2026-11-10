import { KINGDOM_LABEL, poolLabel, scaleLabel, type LifeRecord } from "@/lib/types";
import { memoryFor } from "@/lib/narrative";

export function RevealScreen({ life, beat, onSkip }: { life: LifeRecord; beat: number; onSkip: () => void }) {
  const frames = [
    { kicker: "界", title: KINGDOM_LABEL[life.being.kingdom], sub: life.being.group },
    { kicker: "名字", title: life.being.nameZh, sub: life.being.nameLa },
    { kicker: "地点", title: life.being.place, sub: life.being.sex ?? "这一次没有雌雄之分" },
    { kicker: "概率", title: scaleLabel(life.scale), sub: life.oddsTrue },
  ];
  const frame = frames[Math.min(beat, frames.length - 1)]!;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center px-5 py-16">
      <p className="text-sm tracking-[0.18em] text-accent">{frame.kicker}</p>
      <h1 key={frame.kicker} className="rise mt-4 font-serif text-4xl leading-tight text-fg md:text-6xl">
        {frame.title}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">{frame.sub}</p>
      <button type="button" onClick={onSkip} className="mt-10 min-h-11 self-start text-sm text-faint underline-offset-4 hover:text-fg hover:underline">
        跳过，进入这一生
      </button>
    </div>
  );
}

export function LifeScreen({
  life,
  auto,
  onAuto,
  onChoose,
  onNext,
  onNote,
  onAgain,
  onHome,
  onMammal,
}: {
  life: LifeRecord;
  auto: boolean;
  onAuto: () => void;
  onChoose: (id: string) => void;
  onNext: () => void;
  onNote: (note: string) => void;
  onAgain: () => void;
  onHome: () => void;
  onMammal: () => void;
}) {
  const chapter = life.chapters[life.chapterIndex]!;
  const last = life.chapterIndex >= life.chapters.length - 1;
  const memory = memoryFor(life.chapters, life.choiceId);
  const waiting = Boolean(chapter.choice && !life.choiceId);

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 py-8 md:grid-cols-12 md:px-8">
      <article className="md:col-span-7">
        <p className="text-sm text-accent">
          {poolLabel(life.pool)} · {scaleLabel(life.scale)}
          {life.forced ? " · 指定" : ""}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-fg md:text-5xl">{life.being.nameZh}</h1>
        <p className="mt-2 text-sm italic text-faint">{life.being.nameLa}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {life.being.place}
          {life.being.sex ? ` · ${life.being.sex}` : ""} · 这一次活了{life.livedLabel}
        </p>
        <div className="mt-6 flex gap-2" aria-hidden>
          {life.chapters.map((item, index) => (
            <span key={item.phase} className={"h-1 flex-1 rounded-full " + (index <= life.chapterIndex ? "bg-accent" : "bg-line")} />
          ))}
        </div>

        <div key={chapter.phase + life.chapterIndex} className="rise mt-8">
          <p className="text-xs tracking-[0.16em] text-faint">
            {chapter.phase} · {chapter.when}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-fg">{chapter.title}</h2>
          {chapter.text.map((paragraph, index) => (
            <p key={`${chapter.phase}-${index}`} className="mt-4 text-base leading-relaxed text-fg">
              {paragraph}
            </p>
          ))}
        </div>

        {chapter.choice && !life.choiceId ? (
          <div className="mt-8">
            <p className="text-sm text-muted">{chapter.choice.prompt}</p>
            <div className="mt-3 grid gap-2">
              {chapter.choice.options.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChoose(option.id)}
                  className="min-h-12 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm text-fg hover:border-accent"
                >
                  <span className="mr-2 text-faint">{index + 1}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {memory && chapter.choice ? <p className="mt-6 border-l border-accent pl-4 text-sm leading-relaxed text-muted">{memory}</p> : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!last && !waiting ? (
            <button type="button" onClick={onNext} className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-ink">
              继续
            </button>
          ) : null}
          <button type="button" onClick={onAuto} className="min-h-11 rounded-full border border-line px-4 text-sm text-fg" aria-pressed={auto}>
            {auto ? "暂停自动" : "自动翻页"}
          </button>
        </div>

        {last ? (
          <section className="mt-10 rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-serif text-2xl">留给这个生命一句</h3>
            <p className="mt-2 text-sm text-muted">{life.epitaph}</p>
            <textarea
              value={life.note}
              onChange={(event) => onNote(event.target.value.slice(0, 280))}
              rows={3}
              placeholder="只保存在这台设备上"
              className="mt-4 w-full resize-none rounded-xl border border-line bg-bg px-3 py-3 text-sm text-fg placeholder:text-faint"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={onAgain} className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-ink">
                用同样的范围再出生
              </button>
              {life.pool !== "mammal" ? (
                <button type="button" onClick={onMammal} className="inline-flex min-h-12 items-center rounded-full border border-line px-5 text-sm text-fg">
                  改去哺乳动物里
                </button>
              ) : null}
              <button type="button" onClick={onHome} className="inline-flex min-h-12 items-center px-3 text-sm text-faint">
                回到开头
              </button>
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-xs leading-relaxed text-faint">
          {life.oddsTrue} {life.humanOdds} {life.oddsNote}
        </p>
        {life.counterfactual ? <p className="mt-2 text-xs leading-relaxed text-faint">{life.counterfactual}</p> : null}
        <p className="mt-4 text-xs leading-relaxed text-faint">
          沉重的事按统计发生，不配画面。若你需要支持，请联系当地紧急服务或心理援助。
        </p>
      </article>

      <aside className="md:col-span-5">
        <div className="rounded-2xl border border-line bg-surface/70 p-5">
          <h2 className="font-serif text-xl">同一口签旁边</h2>
          <p className="mt-2 text-sm text-muted">另外四个生命仍按当前范围与刻度随机。它们不是你的同类保证。</p>
          <ul className="mt-4 space-y-4">
            {life.parallels.map((item) => (
              <li key={item.nameLa + item.place} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                <p className="text-sm text-fg">
                  {item.nameZh}
                  <span className="ml-2 text-xs text-faint">{item.kingdom}</span>
                </p>
                <p className="text-xs italic text-faint">{item.nameLa}</p>
                <p className="mt-1 text-sm text-muted">{item.place}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.line}</p>
              </li>
            ))}
          </ul>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-line px-4 py-3">
            <dt className="text-xs text-faint">吃什么</dt>
            <dd className="mt-1 text-fg">{life.being.diet}</dd>
          </div>
          <div className="rounded-2xl border border-line px-4 py-3">
            <dt className="text-xs text-faint">常见跨度</dt>
            <dd className="mt-1 text-fg">{life.being.lifespan}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

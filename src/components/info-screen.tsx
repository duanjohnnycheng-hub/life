import { poolLabel, scaleLabel, type LifeRecord } from "@/lib/types";

export function AboutScreen() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <h1 className="font-serif text-4xl">这口签怎么工作</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
        <p>
          灵感来自「八十亿分之一」那种人生模拟：你不能选择出生的位置，然后把仅有的一生走完。这里把签筒从人类扩大到地球上正在活着的个体。细菌、古菌、硅藻、真菌、草、线虫、鱼、鸡、鼠、人和蓝鲸在同一本账里。
        </p>
        <p>
          真实数量刻度按估计的个体数加权。打开它，你会不断成为微生物，在动物里则几乎总是土壤中的线虫，在脊椎动物里多半是深海的圆罩鱼，在哺乳动物里才经常是鼠、人或家畜。这不是故障。
        </p>
        <p>
          数量级刻度用个体数的对数做权重，好让银杏或蓝鲸有机会出现。页面仍会写出真实概率，避免把镜头误当成普查。
        </p>
        <p>
          比大约一千万亿分之一更稀有的事件，网页里的随机数也分不出来。小头鼠海豚、巨杉、百岁兰因此几乎不会被「真实数量」点到。图鉴允许指定出生，并标明这不是抽签。
        </p>
        <p>
          名录不是完整的物种清单。已被描述的真核生物大约两百万种，真正存在的远多于此；细菌的物种数更是没有公认的上限。未命名类群用来代表那些没有拉丁名的个体。
        </p>
        <p>一生被收成几章，而不是真实的几十年。选择会留下一句你记得的话，很少改写结局。死因来自该类群常见的风险，不配画面。</p>
        <p>
          数量级锚点包括：细菌约 10³⁰（Whitman 等，1998，后续估计有争议）、原绿球藻约 2.9×10²⁷（Flombaum 等，2013）、远洋杆菌约 2.4×10²⁸、线虫约 4.4×10²⁰（van den Hoogen 等，2019）、人类约 81 亿、家鸡约 330 亿。哺乳动物的野生个体数，尤其是鼠，没有全球普查，页面使用了标明不确定的估计。人类出生地按近年各国出生规模归一，不是精确的这一秒。
        </p>
        <p>记录只留在这台设备上。没有账号，也不会把你写下的句子送走。</p>
      </div>
    </div>
  );
}

export function ArchiveScreen({
  lives,
  onOpen,
  onDelete,
}: {
  lives: LifeRecord[];
  onOpen: (life: LifeRecord) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <h1 className="font-serif text-4xl">此前的一生</h1>
      <p className="mt-3 text-sm text-muted">最多留下二十四次，存在这台设备里。</p>
      {lives.length === 0 ? <p className="mt-8 text-muted">还没有走完的一生。</p> : null}
      <ul className="mt-6 space-y-3">
        {lives.map((life) => (
          <li key={life.id} className="rounded-2xl border border-line bg-surface/70 p-4">
            <button type="button" onClick={() => onOpen(life)} className="w-full text-left">
              <span className="block font-serif text-2xl text-fg">{life.being.nameZh}</span>
              <span className="mt-1 block text-sm text-muted">
                {life.being.place} · {life.livedLabel}
              </span>
              <span className="mt-1 block text-xs text-faint">
                {poolLabel(life.pool)} · {scaleLabel(life.scale)}
                {life.forced ? " · 指定" : ""} · {new Date(life.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              {life.note ? <span className="mt-3 block text-sm leading-relaxed text-fg">{life.note}</span> : null}
            </button>
            <button type="button" onClick={() => onDelete(life.id)} className="mt-3 text-xs text-faint underline-offset-4 hover:underline">
              从这台设备删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

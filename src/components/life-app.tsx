import { useEffect, useState } from "react";
import { AtlasScreen } from "@/components/atlas-screen";
import { Field } from "@/components/field";
import { BIRTHS_PER_SEC, DEATHS_PER_SEC, HomeScreen } from "@/components/home-screen";
import { AboutScreen, ArchiveScreen } from "@/components/info-screen";
import { LifeScreen, RevealScreen } from "@/components/read-screen";
import { createLife } from "@/lib/life";
import { loadArchive, loadCurrent, removeArchive, saveCurrent, upsertArchive } from "@/lib/storage";
import type { LifeRecord, PoolId, Scale } from "@/lib/types";

type View = "home" | "reveal" | "life" | "atlas" | "about" | "archive";

export function LifeApp() {
  const [view, setView] = useState<View>("home");
  const [pool, setPool] = useState<PoolId>("all");
  const [scale, setScale] = useState<Scale>("count");
  const [life, setLife] = useState<LifeRecord | null>(null);
  const [archive, setArchive] = useState<LifeRecord[]>([]);
  const [beat, setBeat] = useState(0);
  const [auto, setAuto] = useState(false);
  const [births, setBirths] = useState(0);
  const [deaths, setDeaths] = useState(0);

  useEffect(() => {
    const saved = loadCurrent();
    if (saved) {
      setLife(saved);
      setPool(saved.pool);
      setScale(saved.scale);
      setView("life");
    }
    setArchive(loadArchive());
    const started = performance.now();
    const timer = window.setInterval(() => {
      const seconds = (performance.now() - started) / 1000;
      setBirths(seconds * BIRTHS_PER_SEC);
      setDeaths(seconds * DEATHS_PER_SEC);
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (view !== "reveal") return;
    const timer = window.setTimeout(() => {
      if (beat >= 3) setView("life");
      else setBeat((value) => value + 1);
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [view, beat]);

  useEffect(() => {
    if (!life || view !== "life" || !auto) return;
    const chapter = life.chapters[life.chapterIndex];
    if (!chapter || (chapter.choice && !life.choiceId)) return;
    if (life.chapterIndex >= life.chapters.length - 1) return;
    const timer = window.setTimeout(() => {
      setLife((current) => (current ? { ...current, chapterIndex: current.chapterIndex + 1 } : current));
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [auto, life, view]);

  useEffect(() => {
    if (!life) return;
    saveCurrent(life);
  }, [life]);

  useEffect(() => {
    if (!life || view !== "life") return;
    if (life.chapterIndex < life.chapters.length - 1) return;
    if (!life.archived) {
      setLife({ ...life, archived: true });
      return;
    }
    upsertArchive(life);
    setArchive(loadArchive());
  }, [life, view]);

  function begin(nextPool: PoolId, nextScale: Scale, speciesId?: string) {
    const record = createLife(nextPool, nextScale, speciesId);
    setPool(nextPool);
    setScale(nextScale);
    setLife(record);
    setBeat(0);
    setAuto(false);
    setView("reveal");
  }

  function patch(partial: Partial<LifeRecord>) {
    setLife((current) => (current ? { ...current, ...partial } : current));
  }

  return (
    <main className="relative min-h-screen">
      <Field />
      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3 md:px-8">
          <button type="button" onClick={() => setView("home")} className="font-serif text-xl text-fg">
            生命
          </button>
          <nav className="flex items-center gap-1 text-sm text-muted">
            <NavButton current={view === "atlas"} onClick={() => setView("atlas")} label="图鉴" />
            <NavButton current={view === "archive"} onClick={() => setView("archive")} label="记录" />
            <NavButton current={view === "about"} onClick={() => setView("about")} label="方法" />
          </nav>
        </div>
      </header>

      {view === "home" ? (
        <HomeScreen pool={pool} scale={scale} births={births} deaths={deaths} onPool={setPool} onScale={setScale} onBorn={() => begin(pool, scale)} />
      ) : null}
      {view === "reveal" && life ? <RevealScreen life={life} beat={beat} onSkip={() => setView("life")} /> : null}
      {view === "life" && life ? (
        <LifeScreen
          life={life}
          auto={auto}
          onAuto={() => setAuto((value) => !value)}
          onChoose={(id) => patch({ choiceId: id })}
          onNext={() => patch({ chapterIndex: life.chapterIndex + 1 })}
          onNote={(note) => patch({ note })}
          onAgain={() => begin(life.pool, life.scale)}
          onHome={() => {
            saveCurrent(null);
            setLife(null);
            setView("home");
          }}
          onMammal={() => begin("mammal", life.scale)}
        />
      ) : null}
      {view === "atlas" ? <AtlasScreen pool={pool} scale={scale} onBorn={(id) => begin(pool, scale, id)} /> : null}
      {view === "about" ? <AboutScreen /> : null}
      {view === "archive" ? (
        <ArchiveScreen
          lives={archive}
          onOpen={(item) => {
            setLife(item);
            setView("life");
          }}
          onDelete={(id) => {
            removeArchive(id);
            setArchive(loadArchive());
            if (life?.id === id) {
              saveCurrent(null);
              setLife(null);
            }
          }}
        />
      ) : null}
    </main>
  );
}

function NavButton({ current, label, onClick }: { current: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-current={current ? "page" : undefined} className={"min-h-11 px-3 " + (current ? "text-accent" : "text-muted")}>
      {label}
    </button>
  );
}

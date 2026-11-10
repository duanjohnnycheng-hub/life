import type { Rng } from "@/lib/rng";
import { pick } from "@/lib/rng";
import type { Being, Chapter, HumanFacts } from "@/lib/types";

export function memoryFor(chapters: Chapter[], choiceId: string | null): string | null {
  if (!choiceId) return null;
  for (const chapter of chapters) {
    const option = chapter.choice?.options.find((item) => item.id === choiceId);
    if (option) return option.memory;
  }
  return null;
}

function microbe(being: Being, death: string, early: boolean, rng: Rng): Chapter[] {
  return [
    {
      phase: "诞生",
      title: "单独的一枚",
      when: "开始",
      text: [
        `你在${being.place}成为一个细胞。${being.voice}`,
        being.sense,
        "没有人会给你登记姓名。这一页上的编号只存在于这一次抽签。",
      ],
    },
    {
      phase: "活着",
      title: "短，并且普通",
      when: being.lifespan,
      text: [
        `这类生命常见的跨度是${being.lifespan}。你靠${being.diet}维持自己。`,
        being.reproduction,
        "和你相似的细胞多到无法逐个称呼。你不感到孤独，因为你没有可以感到孤独的结构。",
      ],
    },
    {
      phase: "分岔",
      title: "一点多余的养分",
      when: "中途",
      text: [
        "环境短暂地慷慨了一下。对更大的生物，这甚至不算一个事件。对你，这是这一生里少数可以偏一偏的时刻。",
        "统计基本上不在意你怎么选。",
      ],
      choice: {
        prompt: "你怎么处理这点养分？",
        options: [
          { id: "spend", label: "用掉，准备分裂", memory: "你没有把那点养分留到以后。以后不一定会来。" },
          { id: "save", label: "存着，继续过得很省", memory: "你把养分留在细胞里。吝啬是这类生命最常见的才能。" },
        ],
      },
    },
    {
      phase: "背景",
      title: "死亡是连续的",
      when: early ? "还没走完" : "稍后",
      text: [
        pick(
          [
            "噬菌体在四周巡游，像一场看不见的天气。",
            "比你大不了多少的捕食者在滤水。",
            "干燥、热，或者单纯的饥饿，都在场。",
          ],
          rng,
        ),
        early
          ? "你没有得到走完常见跨度的条件。对这个数量级的生命，这不是意外。"
          : "个体如此之多的时候，死亡是背景，不是新闻。",
      ],
    },
    {
      phase: "终止",
      title: "化学反应停止",
      when: "结束",
      text: [
        death.endsWith("。") ? death : `${death}。`,
        "这里不给细胞编排疼痛。你的物质会变成别人的养分。若按个体计数，这是地球上最常见的一种死法。",
      ],
    },
  ];
}

function plant(being: Being, death: string, early: boolean): Chapter[] {
  return [
    {
      phase: "萌发",
      title: "第一点绿色",
      when: "出土",
      text: [
        `你在${being.place}露出身来。${being.voice}`,
        being.sex ? `这一株是${being.sex}。` : "你并不分成日常意义上的雌雄。",
        being.sense,
      ],
    },
    {
      phase: "生长",
      title: "光和根",
      when: being.lifespan,
      text: [
        `你靠${being.diet}活着。这类生命若能走完常见的跨度，是${being.lifespan}。`,
        being.reproduction,
      ],
    },
    {
      phase: "分岔",
      title: "把生长压向哪里",
      when: "一个季节",
      text: ["资源不够同时满足所有方向。植物一直在做这种不加思索的分配。"],
      choice: {
        prompt: "这一季你更偏向哪边？",
        options: [
          { id: "light", label: "向上，去争光", memory: "你把生长压向高处。叶子多了，根就薄了一点。" },
          { id: "root", label: "向下，去找水", memory: "你把生长压向根。干旱来时你更稳，遮阴来时你更慢。" },
        ],
      },
    },
    {
      phase: "年月",
      title: early ? "没能长成" : "季节重复",
      when: early ? "中断" : "以后",
      text: early
        ? ["常见的跨度没有属于你。风、水、口或镰刀比年轮来得早。", being.note]
        : ["年轮或季节在你身上留下重复的结构。你不回忆它们，你就是它们叠起来的结果。", being.note],
    },
    {
      phase: "终止",
      title: "不再输送",
      when: "结束",
      text: [`结局归在「${death}」。`, "叶或茎会变成下一层土壤。若有种子离开，那是另一口签，不是你。"],
    },
  ];
}

function fungus(being: Being, death: string, early: boolean): Chapter[] {
  return [
    {
      phase: "蔓延",
      title: "细丝",
      when: "开始",
      text: [`你在${being.place}长开。${being.voice}`, being.sense],
    },
    {
      phase: "取食",
      title: "穿过食物",
      when: being.lifespan,
      text: [`你靠${being.diet}延伸。常见的跨度是${being.lifespan}。`, being.reproduction],
    },
    {
      phase: "分岔",
      title: "一块新的底物",
      when: "中途",
      text: ["旁边有一块还没被占领的食物。菌丝可以转向，也可以继续吃脚下的。"],
      choice: {
        prompt: "你往哪边长？",
        options: [
          { id: "new", label: "伸向新的底物", memory: "你把菌丝送进还没人占领的地方。前沿很薄，也更危险。" },
          { id: "stay", label: "继续吃脚下的", memory: "你留在已经熟悉的底物里，直到它变薄。" },
        ],
      },
    },
    {
      phase: "结构",
      title: early ? "没等到子实体" : "偶尔举起的部分",
      when: early ? "中断" : "后来",
      text: early
        ? ["你没来得及把孢子送出去。对真菌，这很常见。"]
        : ["若你属于会结菇的种类，那朵菇只是几天的广告。真正的身体仍在介质里面。"],
    },
    {
      phase: "终止",
      title: "停止延伸",
      when: "结束",
      text: [`「${death}」。`, "孢子若已经离开，它们是新的个体。你停在这里。"],
    },
  ];
}

function invert(being: Being, death: string, early: boolean): Chapter[] {
  return [
    {
      phase: "孵化",
      title: "有了身体",
      when: "开始",
      text: [
        `你在${being.place}开始行动。${being.voice}`,
        being.sex ? `你是${being.sex}。` : "你的繁殖不依赖常见的雌雄分工。",
      ],
    },
    {
      phase: "觅食",
      title: "很小的饥饿",
      when: being.lifespan,
      text: [`你吃${being.diet}。${being.sense}`, `这类生命常见的跨度是${being.lifespan}。${being.reproduction}`],
    },
    {
      phase: "分岔",
      title: "危险的气味",
      when: "中途",
      text: ["附近有食物，也有被吃掉的可能。小动物的决定通常只是方向。"],
      choice: {
        prompt: "你怎么走？",
        options: [
          { id: "feed", label: "去吃", memory: "你朝食物移动。饱是真的，暴露也是真的。" },
          { id: "hide", label: "先躲着", memory: "你停在缝里。饥饿延长了一点，捕食者从旁边过去。" },
        ],
      },
    },
    {
      phase: "数量",
      title: early ? "大多数死在这一段" : "活过最容易死的一段",
      when: early ? "偏早" : "后来",
      text: early
        ? ["你的种类把希望放在数量上，而不是放在每一个个体的幸存上。你属于没能走完的那大多数。"]
        : ["你活过了最容易被吃掉的阶段。这不使你特殊，只说明这一次随机数落在较长的那一侧。", being.note],
    },
    {
      phase: "终止",
      title: "停止",
      when: "结束",
      text: [`结局是「${death}」。`, "没有仪式。物质回到土壤、水或另一个胃。"],
    },
  ];
}

function vertebrate(being: Being, death: string, early: boolean, lived: string): Chapter[] {
  return [
    {
      phase: "出生",
      title: being.clade === "mammal" ? "落地或入水" : "破壳或被产下",
      when: "开始",
      text: [
        `你在${being.place}出生。${being.voice}`,
        being.sex ? `你是${being.sex}。` : "",
        being.sense,
      ].filter(Boolean),
    },
    {
      phase: "成长",
      title: "学会这具身体",
      when: "幼年",
      text: [
        `你靠${being.diet}活下去。${being.reproduction}`,
        `若能走完这类生命常见的跨度，大约是${being.lifespan}。`,
      ],
    },
    {
      phase: "分岔",
      title: "留下，或移动",
      when: "能自己行动之后",
      text: ["地点会改变风险。你不能改变自己是哪一种动物。"],
      choice: {
        prompt: "这一次你更靠近哪边？",
        options: [
          { id: "stay", label: "留在熟悉的地方", memory: "你留在出生附近。熟悉节省能量，也让你避开不了本地的风险。" },
          { id: "move", label: "去食物更多的地方", memory: "你离开熟悉的地点。食物多的地方，捕食者和人也往往更多。" },
        ],
      },
    },
    {
      phase: "壮年",
      title: early ? "没有进入壮年" : "重复的日子",
      when: early ? "偏早" : "中段",
      text: early
        ? ["常见的寿命表在你身上提前结束。对幼体，这是很多物种的默认值。"]
        : ["捕猎、躲藏、繁殖或迁徙重复发生。你不把它们叫做经历，你只是还活着。", being.note],
    },
    {
      phase: "终止",
      title: "这一生停下",
      when: lived,
      text: [
        `你实际停在${lived}。原因记为「${death}」。`,
        "这里不展开场面。更大的动物有时会被人记住，较小的那些只是数量。",
      ],
    },
  ];
}

function incomeLine(income: HumanFacts["income"]): string {
  if (income === "low") return "洁净的水、疫苗和医院都不是默认配置。家里的劳动从很小就开始。";
  if (income === "mid") return "你可以上学，但家里会计算每一笔开支。城市和乡村的差距就在同一国里。";
  return "疫苗、洁净的水和义务教育在这里更像默认。压力多半来自日程、比较和意外，而不是天天的饥饿。";
}

function human(facts: HumanFacts, death: string): Chapter[] {
  const who = `你是${facts.country}的一名${facts.sex}性婴儿`;
  if (facts.age < 1) {
    return [
      {
        phase: "诞生",
        title: "落地",
        when: "第 0 年",
        text: [`${who}，出生在${facts.setting}。`, incomeLine(facts.income), "你没有选择这座城市，也没有选择这一年的医疗条件。"],
      },
      {
        phase: "最初",
        title: "还不会走路",
        when: "数月之内",
        text: ["世界主要是体温、奶或替代品、以及别人是否来得及。", "很多地方，未满一岁的死亡已经变得少见。另一些地方，它仍按统计发生。"],
      },
      {
        phase: "终止",
        title: "没有长成",
        when: "未满一岁",
        text: [`你没有活到一岁。登记上更接近的原因是「${death}」。`, "这里不描写过程。若你需要离开这个页面，可以现在就离开。"],
      },
    ];
  }
  if (facts.age < 5) {
    return [
      {
        phase: "诞生",
        title: "落地",
        when: "第 0 年",
        text: [`${who}，出生在${facts.setting}。`, incomeLine(facts.income)],
      },
      {
        phase: "幼儿",
        title: "刚开始认人",
        when: "一两岁",
        text: ["你学会站起来，也学会腹泻或发烧时家里有没有办法。", "五岁以前是人类死亡率下降最明显的一段，但下降不是均匀地发生在所有国家。"],
      },
      {
        phase: "终止",
        title: "童年没有走完",
        when: `${facts.age} 岁`,
        text: [`你活到大约 ${facts.age} 岁。原因记为「${death}」。`, "这一页只保留原因的名字。"],
      },
    ];
  }
  const adult = facts.age >= 20;
  return [
    {
      phase: "诞生",
      title: "落地",
      when: "第 0 年",
      text: [
        `${who}，出生在${facts.setting}。`,
        incomeLine(facts.income),
        `若只看这个地方的期望寿命，${facts.sex === "女" ? "女" : "男"}性大约是 ${facts.le} 岁。你后来的年纪会在这个数字附近散开，而不是等于它。`,
      ],
    },
    {
      phase: "童年",
      title: "别人决定的几年",
      when: "大约 6 岁",
      text: [
        facts.income === "high"
          ? "你大概率坐进了教室。生病时有人知道该去哪里。"
          : facts.income === "mid"
            ? "你可能上学，也可能在某些季节去帮忙。两条路都常见。"
            : "教室存在，但不总是比田里、摊上或弟弟妹妹更优先。",
        "你仍然不能选择自己已经出生的国家。",
      ],
    },
    {
      phase: "分岔",
      title: "第一次像样的选择",
      when: facts.age < 18 ? "少年" : "大约 18 岁",
      text: ["选择会改写你记得的方式，很少能改写整个统计。出生的地点仍在账上。"],
      choice: {
        prompt: "你把接下来的几年放在哪里？",
        options:
          facts.income === "low"
            ? [
                { id: "leave", label: "离开家乡去找工作", memory: "你离开了熟悉的人。钱有时寄回去，人并不总能回去。" },
                { id: "stay", label: "留在认识的人旁边", memory: "你留下了。日子较窄，关系较密。" },
              ]
            : [
                { id: "study", label: "继续把时间花在学习上", memory: "你多读了一些年。文凭有用，但并不承诺一种生活。" },
                { id: "work", label: "早点自己挣钱", memory: "你更早进入工作。自由和疲惫同时到来。" },
              ],
      },
    },
    {
      phase: adult ? "成年" : "未及成年",
      title: adult ? "重复的责任" : "还没展开的部分",
      when: adult ? "大约 40 岁" : `${facts.age} 岁之前`,
      text: adult
        ? [
            facts.income === "high"
              ? "工作、房租或贷款、父母的年纪、也许有孩子。这些事占据日历。"
              : "养家的账目比自我表达更早到来。健康是一项会突然变贵的开支。",
            "你爱过谁、是否搬家，都不会把你从这张生命表里摘出去。",
          ]
        : ["成年的那些结构还没完全落到你身上。统计在这里提前停了。"],
    },
    {
      phase: "终止",
      title: "这一生的尽头",
      when: `${facts.age} 岁`,
      text: [
        `你在${facts.country}活到 ${facts.age} 岁。死因归在「${death}」。`,
        "同一秒钟里，地球上绝大多数死亡不会被登记成一个人的名字。你的这一次会被，是因为你恰好是人。",
      ],
    },
  ];
}

export function composeChapters(being: Being, death: string, early: boolean, lived: string, humanFacts: HumanFacts | null, rng: Rng): Chapter[] {
  if (being.narrative === "human" && humanFacts) return human(humanFacts, death);
  if (being.narrative === "microbe") return microbe(being, death, early, rng);
  if (being.narrative === "plant") return plant(being, death, early);
  if (being.narrative === "fungus") return fungus(being, death, early);
  if (being.narrative === "invertebrate") return invert(being, death, early);
  return vertebrate(being, death, early, lived);
}

export function epitaph(being: Being, lived: string, death: string): string {
  return `${being.nameZh} · ${being.place} · ${lived} · ${death}`;
}

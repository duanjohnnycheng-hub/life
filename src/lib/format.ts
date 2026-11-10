const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"] as const;

function superscript(n: number): string {
  return String(Math.trunc(Math.abs(n)))
    .split("")
    .map((ch) => SUP[Number(ch)] ?? "")
    .join("");
}

function trimNum(v: number): string {
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(1).replace(/\.0$/, "");
  return (v >= 1 ? v.toFixed(1) : v.toFixed(2)).replace(/\.0$/, "");
}

/** Order-of-magnitude counts. Switches to scientific notation past 京. */
export function sci(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n < 10_000) return Math.round(n).toLocaleString("zh-Hans");
  if (n < 1e8) return `${trimNum(n / 1e4)} 万`;
  if (n < 1e12) return `${trimNum(n / 1e8)} 亿`;
  if (n < 1e16) return `${trimNum(n / 1e12)} 万亿`;
  let exp = Math.floor(Math.log10(n));
  let mant = n / 10 ** exp;
  if (mant >= 9.95) {
    mant = 1;
    exp += 1;
  }
  return `${mant.toFixed(1)}×10${superscript(exp)}`;
}

export function oddsPhrase(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "在双精度能分辨的范围里接近零";
  if (p >= 0.999) return "几乎必然";
  if (p >= 0.01) {
    const pct = p * 100;
    return `约 ${pct.toFixed(pct >= 10 ? 0 : 1)}%`;
  }
  const oneIn = 1 / p;
  if (oneIn < 1e6) return `约 ${Math.round(oneIn).toLocaleString("zh-Hans")} 分之一`;
  return `约 ${sci(oneIn)} 分之一`;
}

export function percentLabel(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "近乎 0";
  if (p >= 0.999) return "几乎全部";
  if (p >= 0.001) return `${(p * 100).toFixed(p >= 0.1 ? 1 : 2)}%`;
  return oddsPhrase(p);
}

export function formatSpan(days: number): string {
  if (days < 1) {
    const hours = Math.max(1, Math.round(days * 24));
    return `大约 ${hours} 小时`;
  }
  if (days < 50) return `大约 ${Math.round(days)} 天`;
  if (days < 730) return `大约 ${Math.max(1, Math.round(days / 30.4))} 个月`;
  const years = days / 365.25;
  if (years < 10) return `大约 ${trimNum(years)} 年`;
  return `大约 ${Math.round(years)} 年`;
}

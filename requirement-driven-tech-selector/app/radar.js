import { levelToNum } from "./scoring.js";
import { criterionLabel } from "./render.js";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function jitterValue(v, techIndex, axisIndex, jitter = 0.01) {
  const seed = (techIndex + 1) * 1009 + (axisIndex + 1) * 9176;
  const s = Math.sin(seed) * 10000;
  const r = (s - Math.floor(s)) * 2 - 1;
  return clamp01(v + r * jitter);
}

export function makeRadar(ctx, criteria, user, techList, opts = {}) {
  const crits = (criteria?.criteria || []);
  const labels = crits.map((c) => criterionLabel(c));
  const jitter = typeof opts.jitter === "number" ? opts.jitter : 0.01;

  const userNorm = crits.map((c) => {
    const d = user?.desired?.[c.id];
    const dn = (typeof d === "number" && Number.isFinite(d)) ? d : 1;
    return clamp01(dn / 2);
  });

  const datasets = [
    {
      label: "User",
      data: userNorm,
      fill: true,
    },
  ];

  techList.forEach((tech, techIdx) => {
    const base = crits.map((c) => {
      const raw = tech?.values?.[c.id];

      if (typeof raw === "number") return clamp01(raw);

      const lv = levelToNum(raw);
      return clamp01(lv / 2);
    });

    const data = base.map((v, axisIdx) => jitterValue(v, techIdx, axisIdx, jitter));

    datasets.push({
      label: tech?.label || tech?.id || "Tech",
      data,
      fill: false,
    });
  });

  return new window.Chart(ctx, {
    type: "radar",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 1,
          ticks: { stepSize: 0.5 },
          pointLabels: { font: { size: 11 } },
        },
      },
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}
import { levelToNum, matchScore } from "./scoring.js";
import { criterionLabel } from "./render.js";

export function makeBar(ctx, criteria, user, tech) {
  const labels = criteria.criteria.map(c => criterionLabel(c));
  const data = criteria.criteria.map(c => {
    const d = user.desired[c.id];
    const p = levelToNum(tech.values[c.id]);
    return matchScore(p, d, (c.direction || c.type));
  });

  return new window.Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Match score f(d,p)",
          data
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { min: 0, max: 1, ticks: { stepSize: 0.25 } }
      },
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

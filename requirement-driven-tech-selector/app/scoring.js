const LEVEL_MAP = { LOW: 0, MID: 1, HIGH: 2 };
const ALLOWED_LEVEL_NUMS = new Set([0, 1, 2]);

function toLevelNumStrict(raw, ctx = "level") {
  if (typeof raw === "string") {
    const k = raw.trim().toUpperCase();
    if (!(k in LEVEL_MAP)) {
      throw new Error(`[scoring] Invalid ${ctx} string: "${raw}" (expected LOW|MID|HIGH)`);
    }
    return LEVEL_MAP[k];
  }

  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      throw new Error(`[scoring] Invalid ${ctx} number: ${raw}`);
    }
    if (raw === 0 || raw === 1 || raw === 2) return raw;

    throw new Error(`[scoring] Non-quantized ${ctx} number: ${raw} (expected 0, 1, 2)`);
  }

  throw new Error(`[scoring] Missing/invalid ${ctx}: ${raw}`);
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function assertCriteriaShape(criteria) {
  if (!criteria || !Array.isArray(criteria.criteria)) {
    throw new Error(`[scoring] Invalid criteria object (missing criteria.criteria array)`);
  }
}

function assertBenchmarksShape(benchmarks) {
  if (!benchmarks || !Array.isArray(benchmarks.technologies)) {
    throw new Error(`[scoring] Invalid benchmarks object (missing benchmarks.technologies array)`);
  }
}

function clampWeightStrict(wRaw, ctx) {
  const n = Number(wRaw);
  if (!Number.isFinite(n)) {
    throw new Error(`[scoring] Invalid weight for ${ctx}: ${wRaw}`);
  }
  return Math.max(1, Math.min(5, n));
}

function assertUserDiscreteDesired(criteria, user) {
  const desired = user?.desired;
  if (!desired || typeof desired !== "object") {
    throw new Error(`[scoring] Missing/invalid user.desired`);
  }
  for (const c of criteria.criteria) {
    const v = desired[c.id];
    if (v === undefined || v === null) {
      throw new Error(`[scoring] Missing user desired level for criterion: "${c.id}"`);
    }
    if (typeof v !== "number" || !ALLOWED_LEVEL_NUMS.has(v)) {
      throw new Error(
        `[scoring] Non-quantized desired number for "${c.id}": ${v} (expected 0, 1, 2)`
      );
    }
  }
}

// p = provided, d = desired
export function matchScore(pRaw, dRaw, critType) {
  const p = toLevelNumStrict(pRaw, "provided");
  const d = toLevelNumStrict(dRaw, "desired");

  const t = String(critType || "")
    .toUpperCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let score;

  if (t === "SYM" || t === "FULL MATCH") {
    score = 1 - (Math.abs(p - d) / 2);
  } else if (t === "UP") {
    score = p >= d ? 1 : (1 - ((d - p) / 2));
  } else if (t === "DOWN") {
    score = p <= d ? 1 : (1 - ((p - d) / 2));
  } else {
    throw new Error(`[scoring] Unknown criterion type/direction: "${critType}"`);
  }

  return clamp01(score);
}

export function computeRanking(criteria, user, benchmarks) {
  assertCriteriaShape(criteria);
  assertBenchmarksShape(benchmarks);

  assertUserDiscreteDesired(criteria, user);

  const rows = [];
  const debug = {
    user,
    perTech: {}
  };

  let sumW = 0;
  for (const c of criteria.criteria) {
    const wRaw = user?.weight?.[c.id];
    if (wRaw === undefined || wRaw === null) {
      throw new Error(`[scoring] Missing user weight for criterion: "${c.id}"`);
    }
    const w = clampWeightStrict(wRaw, `criterion "${c.id}"`);
    sumW += w;
  }
  if (!(sumW > 0)) throw new Error("[scoring] sumW is not positive");

  for (const tech of benchmarks.technologies) {
    if (!tech || !tech.id) {
      throw new Error(`[scoring] Invalid technology entry in benchmarks (missing tech.id)`);
    }

    let num = 0;
    const perCriterion = {};

    for (const c of criteria.criteria) {
      const dRaw = user.desired[c.id];
      const offeredRaw = tech.values?.[c.id];

      if (offeredRaw === undefined || offeredRaw === null) {
        throw new Error(`[scoring] Missing tech value for "${tech.id}" criterion "${c.id}"`);
      }

      const w = clampWeightStrict(user.weight[c.id], `criterion "${c.id}"`);

      const dir = (c.direction || c.type);
      const f = matchScore(offeredRaw, dRaw, dir);

      const contrib = w * f;
      num += contrib;

      perCriterion[c.id] = {
        direction: dir,
        desired: dRaw,
        offered: offeredRaw,
        match: f,
        weight: w,
        contrib
      };
    }

    const score = num / sumW;
    debug.perTech[tech.id] = perCriterion;
    rows.push({
      tech_id: tech.id,
      label: tech.label || tech.id,
      score
    });
  }

  rows.sort((a, b) => b.score - a.score);
  return { ranking: rows, debug };
}

export function levelToNum(level) {
  return toLevelNumStrict(level, "level");
}

export function numToLevel(n) {
  if (n === 0) return "LOW";
  if (n === 1) return "MID";
  if (n === 2) return "HIGH";
  throw new Error(`[scoring] Invalid level number for numToLevel: ${n}`);
}
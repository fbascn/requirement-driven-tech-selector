
const DATA_ROOT = "./data";

export const MACROS = {

 performance: {
   criteria: `${DATA_ROOT}/criteria_performance_scalability.json`,
   questions: `${DATA_ROOT}/questions_performance_scalability.json`,
 },

 architecture: {
   criteria: `${DATA_ROOT}/criteria_arch_gov_security.json`,
   questions: `${DATA_ROOT}/questions_arch_gov_security.json`,
 },

 economic: {
   criteria: `${DATA_ROOT}/criteria_economic_sustainability.json`,
   questions: `${DATA_ROOT}/questions_economic_sustainability.json`,
 },

 reliability: {
   criteria: `${DATA_ROOT}/criteria_reliability.json`,
   questions: `${DATA_ROOT}/questions_reliability.json`,
 }

};


async function loadJSON(path)
{
 const res = await fetch(path, { cache: "no-store" });

 if (!res.ok)
  throw new Error(`Failed to load ${path}`);

 return res.json();
}


async function loadAllTechFiles()
{
 const index = await loadJSON(`${DATA_ROOT}/tech/index.json`);
 const techs = [];
 for (const t of index.technologies)
 {
  try
  {
   const tech =
    await loadJSON(`${DATA_ROOT}/tech/${t.id}.json`);

   techs.push(tech);
  }
  catch(e)
  {
   console.warn(
    `[TechSelector] Missing tech file: ${t.id}.json`
   );
  }
 }

 return techs;
}


function filterTechForCriteria(techs, criteria) {
  const allowed = new Set((criteria?.criteria || []).map(c => c.id));
  const allowedLevels = new Set(["LOW", "MID", "HIGH"]);

  return (techs || []).map(t => {
    if (!t?.values || typeof t.values !== "object") {
      console.warn(`[TechSelector] Tech ${t?.id || "?"} has no values`);
      return { id: t?.id, label: t?.label, values: {} };
    }

    const values = Object.fromEntries(
      Object.entries(t.values)
        .map(([cid, v]) => [cid, typeof v === "string" ? v.trim().toUpperCase() : v])
        .filter(([cid, v]) => allowed.has(cid) && typeof v === "string" && allowedLevels.has(v))
    );

    return {
      id: t.id,
      label: t.label,
      values
    };
  });
}


export async function loadMacro(macroId)
{

 const macro = MACROS[macroId];

 if (!macro)
  throw new Error(`Unknown macro ${macroId}`);


 const [criteria, questions, allTech] = await Promise.all([

  loadJSON(macro.criteria),
  loadJSON(macro.questions),
  loadAllTechFiles()

 ]);


 const benchmarks = {

  technologies:
   filterTechForCriteria(allTech, criteria)

 };


 return {

  criteria,
  questions,
  benchmarks

 };

}


export async function loadMacros(macroIds)
{

 const macros = await Promise.all(
  macroIds.map(loadMacro)
 );



 const criteria = {

  criteria:
   macros.flatMap(m => m.criteria.criteria)

 };



 const techMap = new Map();


 macros.forEach(m => {

  m.benchmarks.technologies.forEach(t => {

   if (!techMap.has(t.id))
    techMap.set(t.id, {
     id: t.id,
     label: t.label,
     values: {}
    });


   Object.assign(
    techMap.get(t.id).values,
    t.values
   );

  });

 });


 const benchmarks = {

  technologies:
   Array.from(techMap.values())

 };


 return {

  criteria,
  benchmarks

 };

}

export async function validateTechFiles()
{

 try
 {

  const techs =
   await loadAllTechFiles();

  techs.forEach(t => {

   if (!t.id)
    console.warn("Tech missing id", t);

   if (!t.label)
    console.warn("Tech missing label", t);

   if (!t.values)
    console.warn("Tech missing values", t);

  });

  console.log(
   `[TechSelector] Validation OK (${techs.length} tech)`
  );

 }
 catch(e)
 {

  console.warn(
   "[TechSelector] Validation failed",
   e
  );

 }

}
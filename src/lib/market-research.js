const ATTRIBUTES = [
  ['visible_result', 'Resultado visible'],
  ['odor_removal', 'Eliminar olor'],
  ['care_no_damage', 'No dañar el mueble'],
  ['drying_speed', 'Rapidez de secado'],
  ['trust_reputation', 'Confianza y reputación'],
  ['price_transparency', 'Precio claro'],
  ['convenience', 'Comodidad a domicilio'],
  ['safety_children_pets', 'Seguridad niños / mascotas'],
];

const CONCEPTS = [
  ['rescue', 'Rescate: recuperar algo que parecía perdido'],
  ['hygiene', 'Higiene: quitar olor, suciedad profunda y alérgenos'],
  ['renewal', 'Renovación: que vuelva a verse y sentirse como nuevo'],
  ['convenience', 'Conveniencia: precio claro, domicilio y rápido secado'],
];

const SEGMENTS = [
  ['rescue', 'Rescate'],
  ['hygiene', 'Higiene'],
  ['renewal', 'Renovación'],
  ['convenience', 'Conveniencia'],
  ['other', 'Otro'],
];

function average(values = []) {
  const usable = values.map(Number).filter(Number.isFinite);
  return usable.length ? usable.reduce((a, b) => a + b, 0) / usable.length : null;
}

function median(values = []) {
  const usable = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!usable.length) return null;
  const mid = Math.floor(usable.length / 2);
  return usable.length % 2 ? usable[mid] : (usable[mid - 1] + usable[mid]) / 2;
}

function distribution(rows, key, catalog) {
  const total = rows.length || 0;
  return catalog.map(([id, label]) => {
    const count = rows.filter((row) => row?.[key] === id).length;
    return { id, label, count, share: total ? count / total : 0 };
  }).sort((a, b) => b.count - a.count);
}

export function summarizeMarketResearch({ interviews = [], attributeScores = [], messageTests = [], evidence = [] } = {}) {
  const attributeSummary = ATTRIBUTES.map(([id, label]) => {
    const rows = attributeScores.filter((row) => row.attribute === id);
    return {
      id,
      label,
      responses: rows.length,
      importance: average(rows.map((row) => row.importance)),
      average_rank: average(rows.map((row) => row.rank).filter((v) => v != null)),
    };
  }).sort((a, b) => (b.importance ?? -1) - (a.importance ?? -1));

  const messageSummary = CONCEPTS.map(([id, label]) => {
    const wins = messageTests.filter((row) => row.winning_concept === id).length;
    return { id, label, wins, share: messageTests.length ? wins / messageTests.length : 0 };
  }).sort((a, b) => b.wins - a.wins);

  const priceFields = ['ps_too_cheap', 'ps_good_value', 'ps_expensive', 'ps_too_expensive'];
  const priceSensitivity = Object.fromEntries(priceFields.map((field) => [
    field,
    median(interviews.map((row) => row[field]).filter((v) => v != null)),
  ]));

  const interviewCount = interviews.length;
  let maturity = 'DESK_RESEARCH';
  let nextAction = 'Completar 10 entrevistas antes de convertir las hipótesis en decisiones de pauta.';
  if (interviewCount >= 10) {
    maturity = 'DIRECTIONAL';
    nextAction = 'Elegir las 2 propuestas de valor líderes y contrastarlas con 10 entrevistas adicionales.';
  }
  if (interviewCount >= 20) {
    maturity = 'PATTERN';
    nextAction = 'Preparar un test de mensajes con presupuesto pequeño y medir conversación → cotización → reserva.';
  }
  if (interviewCount >= 50) {
    maturity = 'QUANTIFIED';
    nextAction = 'Separar resultados por segmento y estimar disposición a pagar y conversión por propuesta de valor.';
  }

  const evidenceByTheme = [...evidence.reduce((map, row) => {
    const theme = row.theme || 'other';
    const current = map.get(theme) || { theme, count: 0, sources: [] };
    current.count += 1;
    if (row.source_name && !current.sources.includes(row.source_name)) current.sources.push(row.source_name);
    map.set(theme, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.count - a.count);

  return {
    maturity,
    next_action: nextAction,
    sample: {
      interviews: interviewCount,
      attribute_responses: attributeScores.length,
      message_tests: messageTests.length,
      secondary_evidence: evidence.length,
    },
    segments: distribution(interviews, 'coded_segment', SEGMENTS),
    attributes: attributeSummary,
    messages: messageSummary,
    price_sensitivity: priceSensitivity,
    evidence_by_theme: evidenceByTheme,
  };
}

export { ATTRIBUTES, CONCEPTS, SEGMENTS };

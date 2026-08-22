const money = (n) => n == null ? '—' : `S/${Number(n).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
const pct = (n) => `${(Number(n || 0) * 100).toFixed(0)}%`;

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

const modeEl = document.querySelector('#research-mode');
const maturityEl = document.querySelector('#maturity');
const sampleNoteEl = document.querySelector('#sample-note');
const kpisEl = document.querySelector('#research-kpis');
const nextActionEl = document.querySelector('#next-action');
const segmentsEl = document.querySelector('#segments');
const attributesEl = document.querySelector('#attributes');
const messagesEl = document.querySelector('#messages');
const priceEl = document.querySelector('#price-sensitivity');
const themesEl = document.querySelector('#evidence-themes');
const evidenceEl = document.querySelector('#evidence');
const form = document.querySelector('#research-form');
const formStatus = document.querySelector('#form-status');
const attributeInputs = document.querySelector('#attribute-inputs');

function renderAttributeInputs() {
  attributeInputs.innerHTML = ATTRIBUTES.map(([id, label], idx) => `
    <div class="attribute-input-row" data-attribute="${id}">
      <span>${label}</span>
      <label>Importancia<select name="importance_${id}">${[1,2,3,4,5].map(v => `<option value="${v}" ${v === 3 ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label>Ranking<select name="rank_${id}"><option value="">—</option>${[1,2,3,4,5,6,7,8].map(v => `<option value="${v}">${v}</option>`).join('')}</select></label>
    </div>`).join('');
}

function renderKpis(data) {
  const items = [
    ['Entrevistas', data.sample.interviews, data.sample.interviews < 10 ? `${10 - data.sample.interviews} para primera lectura` : 'muestra primaria'],
    ['Evidencia secundaria', data.sample.secondary_evidence, 'hipótesis documentadas'],
    ['Tests de mensaje', data.sample.message_tests, 'elecciones forzadas'],
    ['Madurez', data.maturity.replaceAll('_', ' '), 'no confundir hipótesis con validación'],
  ];
  kpisEl.innerHTML = items.map(([label, value, note]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
}

function renderSegments(rows = []) {
  const max = Math.max(...rows.map(r => r.count), 1);
  segmentsEl.innerHTML = rows.map(row => `<div class="mini-bar-row"><span>${row.label}</span><div class="bar"><i style="width:${row.count ? Math.max(6, row.count / max * 100) : 0}%"></i></div><strong>${row.count}</strong></div>`).join('');
}

function renderAttributes(rows = []) {
  const withData = rows.filter(row => row.responses > 0);
  if (!withData.length) {
    attributesEl.innerHTML = '<div class="empty-state">Todavía no hay entrevistas. El dashboard no inventa preferencias: las barras aparecerán cuando registres respuestas reales.</div>';
    return;
  }
  attributesEl.innerHTML = withData.map(row => `<div class="attribute-row"><div><strong>${row.label}</strong><span>${row.responses} respuestas${row.average_rank ? ` · rank medio ${row.average_rank.toFixed(1)}` : ''}</span></div><div class="bar"><i style="width:${(row.importance / 5) * 100}%"></i></div><b>${row.importance.toFixed(1)}</b></div>`).join('');
}

function renderMessages(rows = [], total = 0) {
  if (!total) {
    messagesEl.innerHTML = '<div class="empty-state">Sin ganador todavía. El concepto se pregunta al final de la entrevista para no sesgar el relato inicial.</div>';
    return;
  }
  messagesEl.innerHTML = rows.map(row => `<div class="concept"><strong>${row.label}</strong><span>${row.wins} votos · ${pct(row.share)}</span></div>`).join('');
}

function renderPrice(ps = {}) {
  const items = [
    ['Sospechosamente barato', ps.ps_too_cheap],
    ['Buena relación valor/precio', ps.ps_good_value],
    ['Caro pero todavía posible', ps.ps_expensive],
    ['Demasiado caro', ps.ps_too_expensive],
  ];
  priceEl.innerHTML = items.map(([label, value]) => `<div class="price-card"><span>${label}</span><strong>${money(value)}</strong></div>`).join('');
}

function renderThemes(rows = []) {
  if (!rows.length) return themesEl.innerHTML = '<div class="empty-state">Sin evidencia secundaria.</div>';
  themesEl.innerHTML = rows.map(row => `<div class="theme-chip"><strong>${row.theme.replaceAll('_', ' ')}</strong><span>${row.count} señales · ${row.sources.length} fuentes</span></div>`).join('');
}

function renderEvidence(rows = []) {
  evidenceEl.innerHTML = rows.map(row => `
    <article class="evidence-card">
      <div class="evidence-top"><span class="evidence-confidence ${row.confidence}">${row.confidence}</span><small>${row.geography || '—'}</small></div>
      <h3>${row.source_name}</h3>
      <p>${row.finding}</p>
      ${row.metric_value != null ? `<strong class="evidence-metric">${row.metric_value} <small>${row.metric_unit || ''}</small></strong>` : ''}
      <div class="evidence-context">${row.sample_context || ''}</div>
      ${row.source_url ? `<a href="${row.source_url}" target="_blank" rel="noreferrer">Ver fuente ↗</a>` : ''}
    </article>`).join('');
}

async function loadResearch() {
  const response = await fetch('/api/market-research');
  if (!response.ok) throw new Error('No se pudo leer Market Research');
  const data = await response.json();
  modeEl.textContent = data.mode === 'supabase' ? 'LIVE · Supabase' : 'DEMO';
  maturityEl.textContent = data.maturity.replaceAll('_', ' ');
  sampleNoteEl.textContent = `${data.sample.interviews} entrevistas · ${data.sample.secondary_evidence} señales secundarias`;
  nextActionEl.innerHTML = `<span>Próxima acción</span><strong>${data.next_action}</strong>`;
  renderKpis(data);
  renderSegments(data.segments);
  renderAttributes(data.attributes);
  renderMessages(data.messages, data.sample.message_tests);
  renderPrice(data.price_sensitivity);
  renderThemes(data.evidence_by_theme);
  renderEvidence(data.evidence || []);
}

function formValue(data, name) {
  const value = data.get(name);
  return value == null ? '' : String(value).trim();
}

function numberOrNull(value) {
  if (value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = 'guardando…';
  const data = new FormData(form);
  const adminSecret = formValue(data, 'admin_secret');
  if (!adminSecret) {
    formStatus.textContent = 'falta ADMIN_API_SECRET';
    return;
  }

  const attributes = ATTRIBUTES.map(([id]) => ({
    attribute: id,
    importance: Number(formValue(data, `importance_${id}`)),
    rank: numberOrNull(formValue(data, `rank_${id}`)),
  }));

  const payload = {
    interview: {
      respondent_code: formValue(data, 'respondent_code'),
      source: formValue(data, 'source'),
      customer_stage: formValue(data, 'customer_stage'),
      district: formValue(data, 'district'),
      service_type: formValue(data, 'service_type'),
      trigger: formValue(data, 'trigger'),
      job_to_be_done: formValue(data, 'job_to_be_done'),
      alternatives: formValue(data, 'alternatives').split(',').map(v => v.trim()).filter(Boolean),
      biggest_fear: formValue(data, 'biggest_fear'),
      trust_signal: formValue(data, 'trust_signal'),
      top_factor: formValue(data, 'top_factor'),
      price_paid: numberOrNull(formValue(data, 'price_paid')),
      expected_price: numberOrNull(formValue(data, 'expected_price')),
      ps_too_cheap: numberOrNull(formValue(data, 'ps_too_cheap')),
      ps_good_value: numberOrNull(formValue(data, 'ps_good_value')),
      ps_expensive: numberOrNull(formValue(data, 'ps_expensive')),
      ps_too_expensive: numberOrNull(formValue(data, 'ps_too_expensive')),
      coded_segment: formValue(data, 'coded_segment') || null,
      open_feedback: formValue(data, 'open_feedback'),
    },
    attributes,
    message_test: formValue(data, 'winning_concept') ? {
      winning_concept: formValue(data, 'winning_concept'),
      reason: formValue(data, 'message_reason'),
    } : null,
  };

  try {
    const response = await fetch('/api/market-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || 'No se pudo guardar');
    const secret = adminSecret;
    form.reset();
    form.querySelector('[name="admin_secret"]').value = secret;
    renderAttributeInputs();
    formStatus.textContent = `guardado · ${result.interview_id.slice(0, 8)}`;
    await loadResearch();
  } catch (error) {
    formStatus.textContent = error.message;
  }
});

renderAttributeInputs();
loadResearch().catch((error) => {
  modeEl.textContent = 'sin conexión';
  maturityEl.textContent = 'Error';
  sampleNoteEl.textContent = error.message;
});

const money = (n) => `S/${Number(n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
const pct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;
const multiple = (n) => `${Number(n || 0).toFixed(1)}x`;

const kpisEl = document.querySelector('#kpis');
const decisionsEl = document.querySelector('#decisions');
const funnelEl = document.querySelector('#funnel');
const leadsEl = document.querySelector('#leads');
const eventsEl = document.querySelector('#events');
const modePill = document.querySelector('#mode-pill');
const systemStatus = document.querySelector('#system-status');

function renderKpis(p) {
  const items = [
    ['Inversión', money(p.spend), 'últimos datos disponibles'],
    ['Reservas', p.bookings, `${p.conversations} conversaciones`],
    ['CAC reserva', money(p.cac), 'costo por servicio reservado'],
    ['ROAS', multiple(p.roas), `${money(p.revenue)} atribuibles`],
  ];
  kpisEl.innerHTML = items.map(([label, value, note]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
}

function renderDecisions(rows) {
  decisionsEl.innerHTML = rows.map((row) => `
    <div class="decision">
      <span class="action-badge action-${row.action}">${row.action}</span>
      <div>
        <div class="decision-title">${row.name}</div>
        <div class="decision-meta">CAC ${money(row.cac)} · ROAS ${multiple(row.roas)} · ${row.bookings} reservas<br>${row.reason}</div>
      </div>
      <div class="budget"><span>mañana</span><strong>${row.tomorrowBudget ? money(row.tomorrowBudget) : 'S/0'}</strong></div>
    </div>`).join('');
}

function renderFunnel(p) {
  const rows = [
    ['Clicks', p.clicks],
    ['Chats', p.conversations],
    ['Calificados', p.qualified],
    ['Reservas', p.bookings],
  ];
  const max = Math.max(...rows.map(([, value]) => Number(value || 0)), 1);
  funnelEl.innerHTML = rows.map(([label, value]) => `
    <div class="funnel-row"><span>${label}</span><div class="bar"><i style="width:${Math.max(4, (value / max) * 100)}%"></i></div><strong>${value}</strong></div>`).join('') +
    `<div class="funnel-row"><span>Chat → reserva</span><div class="bar"><i style="width:${Math.max(4, p.leadToBookingRate * 100)}%"></i></div><strong>${pct(p.leadToBookingRate)}</strong></div>`;
}

function renderLeads(rows) {
  leadsEl.innerHTML = rows.slice(0, 8).map((lead) => `
    <tr>
      <td>${lead.id || (lead.phone ? `…${String(lead.phone).slice(-4)}` : 'Lead')}</td>
      <td>${lead.service_type || '—'}</td>
      <td>${lead.district || '—'}</td>
      <td><span class="status">${String(lead.status || 'NUEVO').replaceAll('_', ' ')}</span></td>
      <td>${lead.source_ad || lead.source_ad_id || 'Orgánico / directo'}</td>
      <td>${lead.quoted_price ? money(lead.quoted_price) : '—'}</td>
    </tr>`).join('');
}

function renderEvents(rows) {
  eventsEl.innerHTML = rows.map((event) => `<div class="event"><time>${event.at}</time><div><strong>${event.label}</strong><span>${event.detail}</span></div></div>`).join('');
}

async function loadDashboard() {
  try {
    const [dashboardRes, healthRes] = await Promise.all([fetch('/api/dashboard'), fetch('/api/health')]);
    if (!dashboardRes.ok) throw new Error('No se pudo leer el dashboard');
    const data = await dashboardRes.json();
    const health = healthRes.ok ? await healthRes.json() : { storage: 'unknown', whatsapp: 'unknown' };
    renderKpis(data.portfolio);
    renderDecisions(data.decisions);
    renderFunnel(data.portfolio);
    renderLeads(data.leads || []);
    renderEvents(data.events || []);
    modePill.textContent = data.mode === 'demo' ? 'DEMO · datos sembrados' : 'LIVE · datos persistentes';
    systemStatus.textContent = `Storage: ${health.storage} · WhatsApp: ${health.whatsapp}`;
  } catch (error) {
    modePill.textContent = 'sin conexión';
    systemStatus.textContent = error.message;
  }
}

document.querySelector('#refresh').addEventListener('click', loadDashboard);
loadDashboard();

const SIM_QUESTIONS = [
  { prompt: '¿Qué quieres limpiar?', options: ['🛋️ Sofá / muebles', '🛏️ Colchón', '🧶 Alfombra', '🪑 Sillas', '✨ Varias cosas'] },
  { prompt: 'Perfecto. Cuéntame el tamaño o cantidad aproximada.' },
  { prompt: '¿En qué distrito está el servicio?' },
  { prompt: '📸 ¿Puedes enviarme una foto? Con eso podremos cotizarte mejor.', options: ['📷 Enviar foto', 'Ahora no'] },
  { prompt: '¿Qué te gustaría resolver principalmente?', options: ['Mancha visible', 'Suciedad acumulada', 'Olor', 'Mantenimiento', 'Mascota / niños', 'Otro'] },
  { prompt: '¿Para cuándo te gustaría hacerlo?', options: ['Hoy / mañana', 'Esta semana', 'Próxima semana', 'Solo estoy cotizando'] },
];

const chat = document.querySelector('#chat');
const quickReplies = document.querySelector('#quick-replies');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
let simStep = 0;
let simDone = false;

function bubble(text, who = 'bot') {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function renderQuickReplies(question) {
  quickReplies.innerHTML = '';
  for (const option of question?.options || []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => answer(option));
    quickReplies.appendChild(button);
  }
}

function askCurrent() {
  if (simStep >= SIM_QUESTIONS.length) {
    simDone = true;
    renderQuickReplies(null);
    bubble('¡Listo! Ya tengo lo necesario 🙌. Una persona de LimpiaFast revisará tu caso y te confirmará precio y horarios. No tendrás que repetir la información.');
    return;
  }
  const question = SIM_QUESTIONS[simStep];
  setTimeout(() => {
    bubble(question.prompt);
    renderQuickReplies(question);
  }, 220);
}

function answer(value) {
  if (simDone || !String(value).trim()) return;
  bubble(String(value).trim(), 'user');
  chatInput.value = '';
  simStep += 1;
  renderQuickReplies(null);
  askCurrent();
}

function resetChat() {
  simStep = 0;
  simDone = false;
  chat.innerHTML = '';
  renderQuickReplies(null);
  bubble('👋 ¡Hola! Soy el asistente de LimpiaFast. Te ayudo a cotizar rápido y sin llamadas innecesarias.');
  askCurrent();
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  answer(chatInput.value);
});
document.querySelector('#restart-chat').addEventListener('click', resetChat);
resetChat();

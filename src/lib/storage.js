import { demoAds, demoEvents, demoLeads } from './demo-data.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storageMode = supabaseUrl && supabaseKey ? 'supabase' : 'demo';

function headers(extra = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function request(path, options = {}) {
  if (storageMode !== 'supabase') throw new Error('Persistent storage is not configured');
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: headers(options.headers || {}),
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function listRows(table, query = '') {
  return request(`${table}?${query}`);
}

export async function insertRows(table, rows) {
  return request(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
  });
}

export async function upsertRows(table, rows, onConflict) {
  const suffix = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  return request(`${table}${suffix}`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
  });
}

export async function updateRows(table, filters, patch) {
  const query = Object.entries(filters)
    .map(([key, value]) => `${encodeURIComponent(key)}=eq.${encodeURIComponent(value)}`)
    .join('&');
  return request(`${table}?${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
}

export async function getSession(phone) {
  if (storageMode !== 'supabase') return null;
  const rows = await listRows('bot_sessions', `phone=eq.${encodeURIComponent(phone)}&select=*&limit=1`);
  return rows?.[0] || null;
}

export async function saveSession(session) {
  if (storageMode !== 'supabase') return session;
  const row = {
    phone: session.phone,
    state: session.state,
    step: session.step,
    answers: session.answers,
    updated_at: session.updated_at,
  };
  await upsertRows('bot_sessions', row, 'phone');
  return session;
}

export async function saveMessage({ phone, direction, message_type, body, meta_message_id = null, raw = {} }) {
  if (storageMode !== 'supabase') return null;
  return insertRows('messages', {
    phone,
    direction,
    message_type,
    body,
    meta_message_id,
    raw,
  });
}

export async function upsertLeadFromSession(session, referral = {}) {
  if (storageMode !== 'supabase') return null;
  const answers = session.answers || {};
  const lead = {
    phone: session.phone,
    service_type: answers.service_type || null,
    service_detail: answers.service_detail || null,
    district: answers.district || null,
    photo_received: Boolean(answers.photo_received),
    pain_point: answers.pain_point || null,
    urgency: answers.urgency || null,
    status: session.state,
    source_ad_id: referral.source_id || null,
    ctwa_clid: referral.ctwa_clid || null,
    referral,
    updated_at: new Date().toISOString(),
  };
  return upsertRows('leads', lead, 'phone');
}

export async function dashboardRows() {
  if (storageMode !== 'supabase') {
    return { ads: demoAds, leads: demoLeads, events: demoEvents, mode: 'demo' };
  }

  const [adRows, leads] = await Promise.all([
    listRows('ad_daily_metrics', 'select=*&order=metric_date.desc&limit=250'),
    listRows('leads', 'select=*&order=created_at.desc&limit=50'),
  ]);

  const aggregate = new Map();
  for (const row of adRows || []) {
    const id = row.ad_id || row.ad_name;
    if (!aggregate.has(id)) {
      aggregate.set(id, {
        id,
        name: row.ad_name || id,
        campaign_name: row.campaign_name || 'Meta Ads',
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversations: 0,
        qualified: 0,
        bookings: 0,
        revenue: 0,
        daily_budget: Number(row.daily_budget || 0),
      });
    }
    const ad = aggregate.get(id);
    for (const key of ['spend', 'impressions', 'clicks', 'conversations', 'qualified', 'bookings', 'revenue']) {
      ad[key] += Number(row[key] || 0);
    }
  }

  const events = (leads || []).slice(0, 8).map((lead) => ({
    at: new Date(lead.updated_at || lead.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    label: lead.status || 'Lead',
    detail: [lead.service_type, lead.district].filter(Boolean).join(' · '),
  }));

  return { ads: [...aggregate.values()], leads, events, mode: 'supabase' };
}

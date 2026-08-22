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
  await upsertRows('bot_sessions', {
    phone: session.phone,
    state: session.state,
    step: session.step,
    answers: session.answers,
    updated_at: session.updated_at,
  }, 'phone');
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

export async function upsertLeadFromSession(session, referral = {}, contactName = null) {
  if (storageMode !== 'supabase') return null;
  const answers = session.answers || {};
  return upsertRows('leads', {
    phone: session.phone,
    name: contactName,
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
  }, 'phone');
}

function isQualified(status) {
  return ['QUALIFIED_PENDING_QUOTE', 'QUOTED', 'FOLLOW_UP', 'BOOKED', 'SERVICE_DONE', 'REPEAT_DUE'].includes(status);
}

export async function dashboardRows() {
  if (storageMode !== 'supabase') {
    return { ads: demoAds, leads: demoLeads, events: demoEvents, mode: 'demo' };
  }

  const [adRows, leads] = await Promise.all([
    listRows('ad_daily_metrics', 'select=*&order=metric_date.desc&limit=500'),
    listRows('leads', 'select=*&order=created_at.desc&limit=250'),
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
    for (const key of ['spend', 'impressions', 'clicks', 'conversations']) {
      ad[key] += Number(row[key] || 0);
    }
    if (row.daily_budget) ad.daily_budget = Number(row.daily_budget);
  }

  // Conversion truth comes from first-party leads, not from ad-platform attribution alone.
  for (const lead of leads || []) {
    if (!lead.source_ad_id) continue;
    if (!aggregate.has(lead.source_ad_id)) {
      aggregate.set(lead.source_ad_id, {
        id: lead.source_ad_id,
        name: lead.referral?.headline || lead.source_ad_id,
        campaign_name: 'Click-to-WhatsApp',
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversations: 0,
        qualified: 0,
        bookings: 0,
        revenue: 0,
        daily_budget: 0,
      });
    }
    const ad = aggregate.get(lead.source_ad_id);
    if (isQualified(lead.status)) ad.qualified += 1;
    if (lead.booked || ['BOOKED', 'SERVICE_DONE', 'REPEAT_DUE'].includes(lead.status)) ad.bookings += 1;
    ad.revenue += Number(lead.revenue || (lead.booked ? lead.quoted_price : 0) || 0);
  }

  const events = (leads || []).slice(0, 8).map((lead) => ({
    at: new Date(lead.updated_at || lead.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    label: lead.status || 'Lead',
    detail: [lead.name, lead.service_type, lead.district].filter(Boolean).join(' · '),
  }));

  return { ads: [...aggregate.values()], leads, events, mode: 'supabase' };
}

import { insertRows, storageMode, updateRows } from '../src/lib/storage.js';

function authorized(req) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return bearer === secret || req.headers['x-admin-secret'] === secret;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' });
  if (storageMode !== 'supabase') return res.status(503).json({ error: 'persistent_storage_not_configured' });

  const { phone, status, quoted_price, booked, booking_date, revenue, direct_cost, lost_reason } = req.body || {};
  if (!phone) return res.status(400).json({ error: 'phone_required' });

  const patch = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries({ status, quoted_price, booked, booking_date, revenue, direct_cost, lost_reason })) {
    if (value !== undefined) patch[key] = value;
  }

  try {
    const updated = await updateRows('leads', { phone }, patch);
    const lead = updated?.[0];
    if (lead) {
      await insertRows('lead_events', {
        lead_id: lead.id,
        event_type: status || (booked ? 'BOOKED' : 'UPDATED'),
        payload: patch,
      });
    }
    return res.status(200).json({ ok: true, lead });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'lead_update_failed', message: error.message });
  }
}

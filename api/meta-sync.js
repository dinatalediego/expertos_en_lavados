import { storageMode, upsertRows } from '../src/lib/storage.js';

function authorized(req) {
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const admin = process.env.ADMIN_API_SECRET;
  const cron = process.env.CRON_SECRET;
  return Boolean((admin && bearer === admin) || (cron && bearer === cron) || (admin && req.headers['x-admin-secret'] === admin));
}

function actionCount(actions = [], candidates = []) {
  return actions
    .filter((a) => candidates.includes(a.action_type))
    .reduce((sum, a) => sum + Number(a.value || 0), 0);
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'method_not_allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' });
  if (storageMode !== 'supabase') return res.status(503).json({ error: 'persistent_storage_not_configured' });

  const accountId = process.env.META_AD_ACCOUNT_ID;
  const token = process.env.META_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_VERSION || 'v23.0';
  if (!accountId || !token) return res.status(503).json({ error: 'meta_ads_not_configured' });

  try {
    const fields = 'ad_id,ad_name,adset_name,campaign_name,spend,impressions,clicks,actions,date_start,date_stop';
    const params = new URLSearchParams({
      fields,
      level: 'ad',
      date_preset: 'last_7d',
      time_increment: '1',
      limit: '500',
      access_token: token,
    });
    const url = `https://graph.facebook.com/${version}/act_${String(accountId).replace(/^act_/, '')}/insights?${params}`;
    const response = await fetch(url);
    const json = await response.json();
    if (!response.ok) throw new Error(`Meta ${response.status}: ${JSON.stringify(json)}`);

    const rows = (json.data || []).map((row) => ({
      metric_date: row.date_start,
      ad_id: row.ad_id,
      ad_name: row.ad_name,
      adset_name: row.adset_name,
      campaign_name: row.campaign_name,
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      conversations: actionCount(row.actions, [
        'onsite_conversion.messaging_conversation_started_7d',
        'messaging_conversation_started_7d',
        'onsite_conversion.messaging_first_reply',
      ]),
    }));

    if (rows.length) await upsertRows('ad_daily_metrics', rows, 'metric_date,ad_id');
    return res.status(200).json({ ok: true, rows: rows.length, period: 'last_7d' });
  } catch (error) {
    console.error('meta_sync_failed', error);
    return res.status(500).json({ error: 'meta_sync_failed', message: error.message });
  }
}

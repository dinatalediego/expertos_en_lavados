import { insertRows, listRows, storageMode } from '../src/lib/storage.js';
import { summarizeMarketResearch } from '../src/lib/market-research.js';

function authorized(req) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return bearer === secret || req.headers['x-admin-secret'] === secret;
}

function cleanText(value, max = 1200) {
  if (value == null) return null;
  return String(value).trim().slice(0, max) || null;
}

function cleanNumber(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function getSummary() {
  if (storageMode !== 'supabase') {
    return summarizeMarketResearch();
  }

  const [interviews, attributeScores, messageTests, evidence] = await Promise.all([
    listRows('market_research_interviews', 'select=id,source,customer_stage,district,service_type,coded_segment,ps_too_cheap,ps_good_value,ps_expensive,ps_too_expensive,satisfaction,nps,would_rehire&order=created_at.desc&limit=500'),
    listRows('market_research_attribute_scores', 'select=interview_id,attribute,importance,rank&limit=4000'),
    listRows('market_research_message_tests', 'select=interview_id,winning_concept,rejected_concept&limit=1000'),
    listRows('market_research_evidence', 'select=id,theme,source_name,source_url,geography,sample_context,finding,metric_value,metric_unit,confidence,collected_at&order=collected_at.desc'),
  ]);

  return {
    ...summarizeMarketResearch({ interviews, attributeScores, messageTests, evidence }),
    evidence,
  };
}

async function saveInterview(body = {}) {
  const interview = body.interview || {};
  const respondentCode = cleanText(interview.respondent_code, 64);
  if (!respondentCode) throw new Error('respondent_code_required');

  const inserted = await insertRows('market_research_interviews', {
    respondent_code: respondentCode,
    source: cleanText(interview.source, 40) || 'past_client',
    customer_stage: cleanText(interview.customer_stage, 40) || 'used_service',
    district: cleanText(interview.district, 120),
    service_type: cleanText(interview.service_type, 120),
    last_service_at: interview.last_service_at || null,
    trigger: cleanText(interview.trigger),
    job_to_be_done: cleanText(interview.job_to_be_done),
    alternatives: Array.isArray(interview.alternatives) ? interview.alternatives.slice(0, 12) : [],
    biggest_fear: cleanText(interview.biggest_fear),
    trust_signal: cleanText(interview.trust_signal),
    top_factor: cleanText(interview.top_factor, 120),
    price_paid: cleanNumber(interview.price_paid),
    expected_price: cleanNumber(interview.expected_price),
    ps_too_cheap: cleanNumber(interview.ps_too_cheap),
    ps_good_value: cleanNumber(interview.ps_good_value),
    ps_expensive: cleanNumber(interview.ps_expensive),
    ps_too_expensive: cleanNumber(interview.ps_too_expensive),
    satisfaction: cleanNumber(interview.satisfaction),
    nps: cleanNumber(interview.nps),
    would_rehire: typeof interview.would_rehire === 'boolean' ? interview.would_rehire : null,
    coded_segment: cleanText(interview.coded_segment, 40),
    open_feedback: cleanText(interview.open_feedback, 2500),
    updated_at: new Date().toISOString(),
  });

  const saved = inserted?.[0];
  if (!saved?.id) throw new Error('interview_insert_failed');

  const attributes = Array.isArray(body.attributes) ? body.attributes : [];
  if (attributes.length) {
    await insertRows('market_research_attribute_scores', attributes.slice(0, 8).map((row) => ({
      interview_id: saved.id,
      attribute: row.attribute,
      importance: Number(row.importance),
      rank: row.rank == null || row.rank === '' ? null : Number(row.rank),
    })));
  }

  const messageTest = body.message_test;
  if (messageTest?.winning_concept) {
    await insertRows('market_research_message_tests', {
      interview_id: saved.id,
      winning_concept: messageTest.winning_concept,
      rejected_concept: messageTest.rejected_concept || null,
      reason: cleanText(messageTest.reason, 1200),
    });
  }

  return saved;
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'method_not_allowed' });

  try {
    if (req.method === 'GET') {
      const summary = await getSummary();
      return res.status(200).json({ mode: storageMode, ...summary, generated_at: new Date().toISOString() });
    }

    if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' });
    if (storageMode !== 'supabase') return res.status(503).json({ error: 'persistent_storage_not_configured' });

    const interview = await saveInterview(req.body || {});
    const summary = await getSummary();
    return res.status(201).json({ ok: true, interview_id: interview.id, summary });
  } catch (error) {
    console.error('market_research_failed', error);
    const status = error.message === 'respondent_code_required' ? 400 : 500;
    return res.status(status).json({ error: 'market_research_failed', message: error.message });
  }
}

import crypto from 'node:crypto';
import { advanceSession, startConversation } from '../src/lib/bot.js';
import { extractInbound, sendBotReply } from '../src/lib/meta.js';
import { getSession, saveMessage, saveSession, upsertLeadFromSession } from '../src/lib/storage.js';

function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  return Buffer.from(JSON.stringify(req.body || {}));
}

function verifySignature(req) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return true;
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody(req)).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).json({ error: 'verification_failed' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!verifySignature(req)) return res.status(401).json({ error: 'invalid_signature' });

  try {
    const inbound = extractInbound(req.body);
    if (!inbound) return res.status(200).json({ ok: true, ignored: true });

    const { phone, message, referral } = inbound;
    await saveMessage({
      phone,
      direction: 'inbound',
      message_type: message.type,
      body: message.text?.body || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || (message.type === 'image' ? '[image]' : ''),
      meta_message_id: message.id,
      raw: message,
    });

    let session = await getSession(phone);
    let result;
    if (!session) {
      result = startConversation(phone);
    } else {
      result = advanceSession(session, message);
    }

    session = result.session;
    await saveSession(session);
    await upsertLeadFromSession(session, referral);
    const metaResponse = await sendBotReply(phone, result);

    await saveMessage({
      phone,
      direction: 'outbound',
      message_type: result.question?.options ? 'interactive' : 'text',
      body: result.reply,
      meta_message_id: metaResponse?.messages?.[0]?.id || null,
      raw: metaResponse,
    });

    return res.status(200).json({ ok: true, state: session.state, step: session.step });
  } catch (error) {
    console.error('whatsapp_webhook_error', error);
    // Meta should receive 200 only when processing succeeded; 500 allows retry.
    return res.status(500).json({ error: 'webhook_processing_failed', message: error.message });
  }
}

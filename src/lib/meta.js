const graphVersion = process.env.META_GRAPH_VERSION || 'v23.0';
const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
const accessToken = process.env.META_ACCESS_TOKEN;

export function metaConfigured() {
  return Boolean(phoneNumberId && accessToken);
}

export function buildInteractive(question) {
  if (!question?.options?.length) {
    return { type: 'text', text: { body: question?.prompt || '' } };
  }

  if (question.options.length <= 3) {
    return {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: question.prompt },
        action: {
          buttons: question.options.map((title, index) => ({
            type: 'reply',
            reply: { id: `${question.id}_${index + 1}`, title: title.slice(0, 20) },
          })),
        },
      },
    };
  }

  return {
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: question.prompt },
      action: {
        button: 'Elegir opción',
        sections: [
          {
            title: 'Opciones',
            rows: question.options.map((title, index) => ({
              id: `${question.id}_${index + 1}`,
              title: title.slice(0, 24),
            })),
          },
        ],
      },
    },
  };
}

export async function sendWhatsApp(to, payload) {
  if (!metaConfigured()) {
    return { demo: true, to, payload };
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      ...payload,
    }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(`Meta ${response.status}: ${JSON.stringify(json)}`);
  return json;
}

export async function sendBotReply(to, result) {
  if (result.question) return sendWhatsApp(to, buildInteractive(result.question));
  return sendWhatsApp(to, { type: 'text', text: { body: result.reply } });
}

export function extractInbound(body) {
  const change = body?.entry?.[0]?.changes?.[0]?.value;
  const message = change?.messages?.[0];
  const contact = change?.contacts?.[0];
  if (!message) return null;
  return {
    phone: message.from,
    name: contact?.profile?.name || null,
    message,
    referral: message.referral || {},
    metadata: change?.metadata || {},
  };
}

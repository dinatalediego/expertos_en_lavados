import { flow, requiredFields } from './flow.js';

export function newSession(phone) {
  return {
    phone,
    state: 'QUALIFYING',
    step: 0,
    answers: {},
    updated_at: new Date().toISOString(),
  };
}

export function normalizeInbound(message = {}) {
  if (message.type === 'image') return { value: true, display: 'Foto recibida', mediaId: message.image?.id || null };
  if (message.type === 'interactive') {
    const reply = message.interactive?.button_reply || message.interactive?.list_reply || {};
    return { value: reply.title || reply.id || '', display: reply.title || reply.id || '' };
  }
  const text = message.text?.body?.trim() || '';
  return { value: text, display: text };
}

export function questionFor(session) {
  return flow.questions[session.step] || null;
}

export function advanceSession(session, inbound) {
  const current = questionFor(session);
  if (!current) {
    return { session, reply: flow.handoffMessage, completed: true };
  }

  const answer = normalizeInbound(inbound);
  const next = { ...session, answers: { ...session.answers }, updated_at: new Date().toISOString() };

  if (current.type === 'media_optional' && inbound.type !== 'image') {
    next.answers[current.id] = false;
    // Treat the received text as a skip; the user can still send a photo later.
  } else {
    next.answers[current.id] = answer.value;
  }

  next.step += 1;
  const nextQuestion = questionFor(next);
  if (!nextQuestion) {
    next.state = requiredFields.every((key) => Boolean(next.answers[key])) ? 'QUALIFIED_PENDING_QUOTE' : 'QUALIFYING';
    return { session: next, reply: flow.handoffMessage, completed: true };
  }

  return { session: next, reply: nextQuestion.prompt, question: nextQuestion, completed: false };
}

export function startConversation(phone) {
  const session = newSession(phone);
  return {
    session,
    reply: `${flow.entryMessage}\n\n${flow.questions[0].prompt}`,
    question: flow.questions[0],
    completed: false,
  };
}

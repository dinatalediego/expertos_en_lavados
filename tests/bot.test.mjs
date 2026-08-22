import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSession, newSession, startConversation } from '../src/lib/bot.js';

test('starts by asking service type', () => {
  const result = startConversation('51999999999');
  assert.equal(result.session.state, 'QUALIFYING');
  assert.equal(result.session.step, 0);
  assert.equal(result.question.id, 'service_type');
});

test('advances through all questions and hands off qualified lead', () => {
  let session = newSession('51999999999');
  const messages = [
    { type: 'text', text: { body: 'Sofá / muebles' } },
    { type: 'text', text: { body: '3 cuerpos' } },
    { type: 'text', text: { body: 'Surco' } },
    { type: 'image', image: { id: 'media_1' } },
    { type: 'text', text: { body: 'Mascota / niños' } },
    { type: 'text', text: { body: 'Esta semana' } },
  ];

  let result;
  for (const message of messages) {
    result = advanceSession(session, message);
    session = result.session;
  }

  assert.equal(result.completed, true);
  assert.equal(session.state, 'QUALIFIED_PENDING_QUOTE');
  assert.equal(session.answers.district, 'Surco');
  assert.equal(session.answers.photo_received, true);
  assert.match(result.reply, /No tendrás que repetir/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMarketResearch } from '../src/lib/market-research.js';

test('desk research stays hypothesis-only with no interviews', () => {
  const result = summarizeMarketResearch({
    evidence: [
      { theme: 'trust', source_name: 'A' },
      { theme: 'trust', source_name: 'B' },
      { theme: 'price_transparency', source_name: 'C' },
    ],
  });

  assert.equal(result.maturity, 'DESK_RESEARCH');
  assert.equal(result.sample.interviews, 0);
  assert.equal(result.sample.secondary_evidence, 3);
  assert.equal(result.evidence_by_theme[0].theme, 'trust');
  assert.match(result.next_action, /10 entrevistas/i);
});

test('summarizes attributes, segments, messages and price medians', () => {
  const interviews = [
    { coded_segment: 'rescue', ps_too_cheap: 60, ps_good_value: 100, ps_expensive: 150, ps_too_expensive: 220 },
    { coded_segment: 'hygiene', ps_too_cheap: 80, ps_good_value: 120, ps_expensive: 180, ps_too_expensive: 250 },
    { coded_segment: 'rescue', ps_too_cheap: 70, ps_good_value: 110, ps_expensive: 160, ps_too_expensive: 240 },
  ];
  const attributeScores = [
    { attribute: 'trust_reputation', importance: 5, rank: 1 },
    { attribute: 'trust_reputation', importance: 4, rank: 2 },
    { attribute: 'price_transparency', importance: 4, rank: 2 },
    { attribute: 'price_transparency', importance: 4, rank: 3 },
  ];
  const messageTests = [
    { winning_concept: 'rescue' },
    { winning_concept: 'rescue' },
    { winning_concept: 'hygiene' },
  ];

  const result = summarizeMarketResearch({ interviews, attributeScores, messageTests });

  assert.equal(result.segments[0].id, 'rescue');
  assert.equal(result.segments[0].count, 2);
  assert.equal(result.attributes[0].id, 'trust_reputation');
  assert.equal(result.attributes[0].importance, 4.5);
  assert.equal(result.messages[0].id, 'rescue');
  assert.equal(result.messages[0].wins, 2);
  assert.equal(result.price_sensitivity.ps_good_value, 110);
  assert.equal(result.price_sensitivity.ps_too_expensive, 240);
});

test('research maturity advances only with primary interviews', () => {
  const mk = (n) => Array.from({ length: n }, (_, i) => ({ coded_segment: i % 2 ? 'hygiene' : 'rescue' }));
  assert.equal(summarizeMarketResearch({ interviews: mk(10) }).maturity, 'DIRECTIONAL');
  assert.equal(summarizeMarketResearch({ interviews: mk(20) }).maturity, 'PATTERN');
  assert.equal(summarizeMarketResearch({ interviews: mk(50) }).maturity, 'QUANTIFIED');
});

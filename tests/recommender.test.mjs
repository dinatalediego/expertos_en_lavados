import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreAd } from '../src/lib/recommender.js';

test('finances an ad with healthy CAC and ROAS', () => {
  const result = scoreAd({
    spend: 210,
    impressions: 10000,
    clicks: 500,
    conversations: 80,
    qualified: 50,
    bookings: 10,
    revenue: 1800,
    daily_budget: 30,
  }, { targetCAC: 40, targetROAS: 3, minSpend: 120 });
  assert.equal(result.action, 'FINANCIAR');
  assert.equal(result.tomorrowBudget, 39);
  assert.ok(result.roas > 8);
});

test('cuts an ad after enough spend with no bookings', () => {
  const result = scoreAd({
    spend: 150,
    impressions: 10000,
    clicks: 300,
    conversations: 30,
    qualified: 18,
    bookings: 0,
    revenue: 0,
    daily_budget: 25,
  }, { targetCAC: 40, targetROAS: 3, minSpend: 120 });
  assert.equal(result.action, 'APAGAR');
  assert.equal(result.tomorrowBudget, 0);
});

test('keeps learning when evidence is insufficient', () => {
  const result = scoreAd({
    spend: 60,
    impressions: 5000,
    clicks: 120,
    conversations: 15,
    qualified: 9,
    bookings: 1,
    revenue: 150,
    daily_budget: 20,
  }, { targetCAC: 40, targetROAS: 3, minSpend: 120 });
  assert.equal(result.action, 'APRENDER');
});

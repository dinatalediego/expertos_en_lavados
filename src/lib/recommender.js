const n = (value) => Number(value || 0);
const safeDiv = (a, b) => (n(b) > 0 ? n(a) / n(b) : 0);

export function scoreAd(ad, thresholds = {}) {
  const targetCAC = n(thresholds.targetCAC || process.env.TARGET_CAC_PEN || 40);
  const targetROAS = n(thresholds.targetROAS || process.env.TARGET_ROAS || 3);
  const minSpend = n(thresholds.minSpend || process.env.MIN_TEST_SPEND_PEN || 120);

  const spend = n(ad.spend);
  const impressions = n(ad.impressions);
  const clicks = n(ad.clicks);
  const conversations = n(ad.conversations);
  const qualified = n(ad.qualified);
  const bookings = n(ad.bookings);
  const revenue = n(ad.revenue);

  const metrics = {
    ctr: safeDiv(clicks, impressions),
    cpc: safeDiv(spend, clicks),
    costPerConversation: safeDiv(spend, conversations),
    costPerQualified: safeDiv(spend, qualified),
    cac: safeDiv(spend, bookings),
    roas: safeDiv(revenue, spend),
    qualifiedRate: safeDiv(qualified, conversations),
    bookingRate: safeDiv(bookings, qualified),
  };

  let action = 'APRENDER';
  let reason = 'Aún falta evidencia para aumentar o cortar inversión.';
  let tomorrowBudget = n(ad.daily_budget || spend / 7 || 0);

  if (bookings >= 2 && metrics.cac <= targetCAC && metrics.roas >= targetROAS) {
    action = 'FINANCIAR';
    reason = `Reserva clientes por debajo del CAC objetivo y supera ROAS ${targetROAS.toFixed(1)}x.`;
    tomorrowBudget *= 1.3;
  } else if (
    spend >= minSpend &&
    (bookings === 0 || metrics.cac > targetCAC * 1.4 || (revenue > 0 && metrics.roas < targetROAS * 0.6))
  ) {
    action = 'APAGAR';
    reason = 'Ya consumió presupuesto suficiente sin demostrar una economía de reserva saludable.';
    tomorrowBudget = 0;
  }

  return {
    ...ad,
    ...metrics,
    action,
    reason,
    tomorrowBudget: Math.round(tomorrowBudget),
    thresholds: { targetCAC, targetROAS, minSpend },
  };
}

export function rankAds(ads, thresholds = {}) {
  const priority = { FINANCIAR: 0, APRENDER: 1, APAGAR: 2 };
  return ads
    .map((ad) => scoreAd(ad, thresholds))
    .sort((a, b) => priority[a.action] - priority[b.action] || b.roas - a.roas);
}

export function summarizePortfolio(ads) {
  const totals = ads.reduce(
    (acc, ad) => {
      for (const key of ['spend', 'impressions', 'clicks', 'conversations', 'qualified', 'bookings', 'revenue']) {
        acc[key] += n(ad[key]);
      }
      return acc;
    },
    { spend: 0, impressions: 0, clicks: 0, conversations: 0, qualified: 0, bookings: 0, revenue: 0 },
  );

  return {
    ...totals,
    cac: safeDiv(totals.spend, totals.bookings),
    roas: safeDiv(totals.revenue, totals.spend),
    leadToBookingRate: safeDiv(totals.bookings, totals.conversations),
  };
}

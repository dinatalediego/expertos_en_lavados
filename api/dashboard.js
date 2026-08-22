import { dashboardRows } from '../src/lib/storage.js';
import { rankAds, summarizePortfolio } from '../src/lib/recommender.js';

export default async function handler(req, res) {
  try {
    const data = await dashboardRows();
    const decisions = rankAds(data.ads);
    const portfolio = summarizePortfolio(data.ads);
    res.status(200).json({
      mode: data.mode,
      portfolio,
      decisions,
      leads: data.leads,
      events: data.events,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'dashboard_unavailable', message: error.message });
  }
}

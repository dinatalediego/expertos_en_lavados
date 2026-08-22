export const demoAds = [
  {
    id: 'ad_transformacion_sofa',
    name: 'Tu sofá vuelve a sentirse limpio',
    campaign_name: 'Prospección · Transformación',
    spend: 210,
    impressions: 18400,
    clicks: 642,
    conversations: 86,
    qualified: 58,
    bookings: 14,
    revenue: 2380,
    daily_budget: 35,
  },
  {
    id: 'ad_expertos_estatico',
    name: 'Llegaron los expertos en lavado',
    campaign_name: 'Prospección · Servicio',
    spend: 196,
    impressions: 16100,
    clicks: 421,
    conversations: 51,
    qualified: 27,
    bookings: 2,
    revenue: 300,
    daily_budget: 30,
  },
  {
    id: 'ad_colchon_before_after',
    name: 'Antes / después de colchón',
    campaign_name: 'Prospección · Evidencia',
    spend: 92,
    impressions: 8900,
    clicks: 255,
    conversations: 31,
    qualified: 22,
    bookings: 3,
    revenue: 480,
    daily_budget: 20,
  },
];

export const demoLeads = [
  { id: 'LF-1082', created_at: '2026-08-21T20:52:00-05:00', name: 'María', phone: '***714', service_type: 'Sofá / muebles', district: 'Santiago de Surco', urgency: 'Esta semana', status: 'BOOKED', source_ad: 'Tu sofá vuelve a sentirse limpio', quoted_price: 180 },
  { id: 'LF-1081', created_at: '2026-08-21T20:31:00-05:00', name: 'Carlos', phone: '***921', service_type: 'Colchón', district: 'Miraflores', urgency: 'Hoy / mañana', status: 'QUALIFIED_PENDING_QUOTE', source_ad: 'Antes / después de colchón', quoted_price: null },
  { id: 'LF-1080', created_at: '2026-08-21T19:44:00-05:00', name: 'Andrea', phone: '***403', service_type: 'Sillas', district: 'San Borja', urgency: 'Próxima semana', status: 'QUOTED', source_ad: 'Tu sofá vuelve a sentirse limpio', quoted_price: 160 },
  { id: 'LF-1079', created_at: '2026-08-21T18:56:00-05:00', name: 'Lucía', phone: '***018', service_type: 'Sofá / muebles', district: 'La Molina', urgency: 'Esta semana', status: 'BOOKED', source_ad: 'Tu sofá vuelve a sentirse limpio', quoted_price: 210 },
  { id: 'LF-1078', created_at: '2026-08-21T18:21:00-05:00', name: 'José', phone: '***655', service_type: 'Alfombra', district: 'Barranco', urgency: 'Solo estoy cotizando', status: 'QUALIFYING', source_ad: 'Llegaron los expertos en lavado', quoted_price: null },
  { id: 'LF-1077', created_at: '2026-08-21T17:48:00-05:00', name: 'Paola', phone: '***337', service_type: 'Varias cosas', district: 'Magdalena', urgency: 'Esta semana', status: 'QUOTED', source_ad: 'Tu sofá vuelve a sentirse limpio', quoted_price: 280 },
];

export const demoEvents = [
  { at: '20:52', label: 'Reserva confirmada', detail: 'María · sofá · Surco · S/180' },
  { at: '20:33', label: 'Lead calificado', detail: 'Carlos envió foto de colchón' },
  { at: '19:46', label: 'Cotización enviada', detail: 'Andrea · 6 sillas · S/160' },
  { at: '18:58', label: 'Reserva confirmada', detail: 'Lucía · sofá · La Molina · S/210' },
];

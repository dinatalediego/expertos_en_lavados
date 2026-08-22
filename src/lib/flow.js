export const flow = {
  version: '0.2',
  brand: 'LimpiaFast',
  entryMessage: '👋 ¡Hola! Soy el asistente de LimpiaFast. Te ayudo a cotizar rápido y sin llamadas innecesarias.',
  questions: [
    {
      id: 'service_type',
      prompt: '¿Qué quieres limpiar?',
      type: 'options',
      options: ['🛋️ Sofá / muebles', '🛏️ Colchón', '🧶 Alfombra', '🪑 Sillas', '✨ Varias cosas'],
    },
    {
      id: 'service_detail',
      prompt: 'Perfecto. Cuéntame el tamaño o cantidad aproximada. Ej.: sofá de 3 cuerpos, 6 sillas o colchón queen.',
      type: 'text',
    },
    {
      id: 'district',
      prompt: '¿En qué distrito está el servicio?',
      type: 'text',
    },
    {
      id: 'photo_received',
      prompt: '📸 Envíame una foto si puedes. Nos ayuda a darte una cotización mucho más precisa.',
      type: 'media_optional',
    },
    {
      id: 'pain_point',
      prompt: '¿Qué te gustaría resolver principalmente?',
      type: 'options',
      options: ['Mancha visible', 'Suciedad acumulada', 'Olor', 'Mantenimiento', 'Mascota / niños', 'Otro'],
    },
    {
      id: 'urgency',
      prompt: '¿Para cuándo te gustaría hacerlo?',
      type: 'options',
      options: ['Hoy / mañana', 'Esta semana', 'Próxima semana', 'Solo estoy cotizando'],
    },
  ],
  handoffMessage: '¡Listo! Ya tengo lo necesario 🙌. Una persona de LimpiaFast revisará tu caso y te confirmará precio y horarios disponibles. No tendrás que repetir la información.',
};

export const requiredFields = ['service_type', 'service_detail', 'district', 'urgency'];

import { storageMode } from '../src/lib/storage.js';
import { metaConfigured } from '../src/lib/meta.js';

export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'limpiafast-growth-os',
    version: '0.2.0',
    storage: storageMode,
    whatsapp: metaConfigured() ? 'configured' : 'demo',
    now: new Date().toISOString(),
  });
}

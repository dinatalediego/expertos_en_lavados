# LimpiaFast — Growth & Marketing Operating System

Este repositorio convierte el emprendimiento de lavado de muebles en un sistema comercial medible: **anuncio → conversación inmediata → calificación → cotización → reserva → servicio → recompra/referido**.

## Tesis CEO

LimpiaFast no vende “lavado”. Vende una transformación emocional y funcional:

> **Volver a sentir que tu sala, colchón o alfombra está limpia, fresca y lista para disfrutarla.**

El cliente no debería preguntarse “¿cómo cotizo?”. El anuncio debe llevarlo directo a WhatsApp y el primer minuto de conversación debe ser guiado, simple y útil.

## North Star

La métrica principal no será el CTR ni la cantidad de chats. Será:

**CAC por servicio reservado / margen de contribución por servicio.**

Indicadores del funnel:

1. Costo por conversación iniciada.
2. % de conversaciones que completan la calificación.
3. % de leads calificados que reciben cotización.
4. % de cotizaciones que reservan.
5. Ticket promedio.
6. CAC por reserva.
7. Margen después de pauta.
8. Recompra y referidos.

## Estrategia en una frase

**Mostrar el “después” que la persona quiere sentir, reducir a un clic el paso a WhatsApp y responder inmediatamente con un flujo de máximo seis preguntas.**

## Qué se implementa en este repositorio

- [`docs/01_estrategia_ceo.md`](docs/01_estrategia_ceo.md): necesidad del cliente, posicionamiento, propuesta de valor y ventaja competitiva.
- [`docs/02_meta_ads_playbook.md`](docs/02_meta_ads_playbook.md): estructura de campañas, audiencias, presupuesto, anuncios y reglas de optimización.
- [`docs/03_whatsapp_experience.md`](docs/03_whatsapp_experience.md): experiencia de conversación inmediata y handoff a una persona.
- [`docs/04_creative_lab.md`](docs/04_creative_lab.md): conceptos de anuncios centrados en transformación, no en “servicio técnico”.
- [`docs/05_medicion_y_experimentos.md`](docs/05_medicion_y_experimentos.md): funnel, KPIs, experimentos y criterios de escala.
- [`docs/06_plan_30_dias.md`](docs/06_plan_30_dias.md): ejecución comercial de los primeros 30 días.
- [`config/whatsapp_flow.yaml`](config/whatsapp_flow.yaml): flujo base del bot/automatización.
- [`data/lead_tracking_template.csv`](data/lead_tracking_template.csv): estructura mínima para medir cada lead.

## Primer enlace de cotización

Número mostrado en el material actual: **993 984 874**.

Enlace directo sugerido:

`https://wa.me/51993984874?text=Hola%20LimpiaFast%2C%20quiero%20cotizar%20una%20limpieza`

En Meta Ads conviene configurar WhatsApp directamente como destino del anuncio para conservar mejor el contexto de la campaña.

## Decisión de lanzamiento

No empezar con diez campañas. Empezar con una arquitectura simple:

- **Campaña 1 — Prospección:** personas nuevas en zonas donde realmente se puede atender.
- **Campaña 2 — Remarketing:** personas que interactuaron, vieron video, escribieron o cotizaron sin reservar.
- **3 familias creativas:** transformación visual, alivio/emoción y evidencia/confianza.
- **Una sola experiencia de WhatsApp**, rápida y medible.

El sistema escala únicamente cuando una combinación de anuncio + audiencia + conversación produce reservas rentables.

## Principio operativo

**No optimizar “leads baratos”. Optimizar reservas rentables.** Un lead barato que nunca manda foto, no acepta cotización o está fuera de zona consume tiempo y presupuesto.

## Fuentes Meta usadas como referencia

- Meta — Ads that click to message: https://www.facebook.com/business/ads/click-to-message-ads
- Meta — Lead ads with messaging: https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-messaging
- Meta — Engagement objective / Messages: https://www.facebook.com/business/ads/ad-objectives/engagement

---

**Estado:** v0.1 — estrategia lista para ejecutar y medir.
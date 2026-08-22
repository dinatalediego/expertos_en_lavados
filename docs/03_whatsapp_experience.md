# 03 — WhatsApp Experience

## Objetivo

Que una persona que toca el anuncio sienta inmediatamente:

> “Esto es fácil. Ya entendieron lo que necesito y me van a ayudar.”

La automatización no debe intentar reemplazar a la persona que vende. Debe **capturar contexto, reducir preguntas repetidas y acelerar la cotización**.

## Principio

**Bot primero para ordenar; humano después para cerrar.**

## Primer mensaje

> 👋 ¡Hola! Soy el asistente de LimpiaFast. Te ayudo a cotizar rápido.
>
> ¿Qué quieres limpiar hoy?

Opciones:

- 🛋️ Sofá / muebles
- 🛏️ Colchón
- 🧶 Alfombra
- 🪑 Sillas
- ✨ Varias cosas

## Flujo recomendado

### Pregunta 1 — Servicio

`¿Qué quieres limpiar?`

Guardar: `service_type`.

### Pregunta 2 — Cantidad / tamaño

Según la respuesta:

- Sofá: 1 cuerpo / 2 / 3 / seccional / juego de sala.
- Colchón: 1 plaza / 1.5 / 2 / queen / king.
- Sillas: cantidad.
- Alfombra: medida aproximada.

Guardar: `service_detail`.

### Pregunta 3 — Distrito

> ¿En qué distrito está el servicio?

Guardar: `district`.

Esto permite identificar cobertura, costo logístico y campañas por zona.

### Pregunta 4 — Evidencia

> 📸 Perfecto. ¿Puedes enviarme una foto? Con eso podremos cotizarte mejor.

Guardar: `photo_received = yes/no`.

La foto reduce ambigüedad y permite detectar casos especiales.

### Pregunta 5 — Dolor principal

> ¿Qué te gustaría resolver principalmente?

Opciones:

- Mancha visible
- Suciedad acumulada
- Olor
- Mantenimiento
- Mascota / niños
- Otro

Guardar: `pain_point`.

### Pregunta 6 — Momento

> ¿Para cuándo te gustaría hacerlo?

Opciones:

- Hoy / mañana
- Esta semana
- Próxima semana
- Solo estoy cotizando

Guardar: `urgency`.

## Momento de handoff

Cuando tengamos servicio + distrito + foto (idealmente) + urgencia:

> ¡Listo! Ya tengo lo necesario 🙌. Una persona de LimpiaFast revisará las fotos y te confirmará precio y horarios disponibles. No tendrás que repetir la información.

Crear estado:

`QUALIFIED_PENDING_QUOTE`

## Estados del lead

1. `NEW_CHAT`
2. `QUALIFYING`
3. `QUALIFIED_PENDING_QUOTE`
4. `QUOTED`
5. `FOLLOW_UP`
6. `BOOKED`
7. `SERVICE_DONE`
8. `LOST`
9. `REPEAT_DUE`

## SLA comercial

La promesa de “respuesta inmediata” exige operación real.

- Automatización: instantánea.
- Revisión humana de lead calificado: ideal < 5 minutos durante horario operativo.
- Lead cotizado sin respuesta: seguimiento.

## Follow-up

### Sin foto

> Nos falta solo una foto para poder orientarte mejor con la cotización 😊. Puedes enviarla por aquí cuando la tengas.

### Cotizó, no reservó

> Hola 👋 ¿Te gustaría que revisemos horarios disponibles para tu limpieza? Si quieres, te digo qué opciones tenemos.

### Servicio terminado

> ¡Gracias por confiar en LimpiaFast! Si te gustó cómo quedó, una recomendación o foto del resultado nos ayuda muchísimo 🙌.

### Recompra

Registrar una fecha tentativa y volver a contactar solo con una comunicación pertinente y respetando consentimiento y políticas aplicables.

## Datos mínimos que la conversación debe capturar

- timestamp,
- teléfono / identificador,
- campaña,
- anuncio,
- servicio,
- detalle,
- distrito,
- dolor,
- urgencia,
- foto recibida,
- precio cotizado,
- reserva,
- valor del servicio,
- motivo de pérdida.

## Arquitectura tecnológica por etapas

### Etapa 0 — inmediata

Meta Ads → WhatsApp Business → respuestas rápidas + etiquetas + tracking manual/CSV.

### Etapa 1 — automatización

Meta Ads → WhatsApp Business Platform / proveedor compatible → webhook → motor conversacional → Google Sheet/DB/CRM → operador humano.

### Etapa 2 — growth loop

Datos de reservas → dashboard → clasificación por anuncio/distrito/servicio → audiencias/creativos → nuevas campañas.

## Regla de UX

Nunca pedir diez datos antes de ayudar. Cada interacción debe sentirse como avanzar hacia la cotización.
# 05 — Medición y Experimentos

## North Star

**Margen de contribución generado por cada sol invertido en pauta.**

La pauta se administra como una inversión comercial, no como una compra de alcance.

## Funnel mínimo

`Impresión → clic/mensaje → conversación → lead calificado → cotización → reserva → servicio realizado → recompra/referido`

## KPIs

### Adquisición

- CPM
- CTR
- costo por conversación iniciada

### Calidad

- % conversaciones con distrito válido
- % conversaciones con foto
- % leads calificados

### Venta

- % lead calificado → cotización
- % cotización → reserva
- tiempo medio de respuesta
- ticket promedio

### Economía

- CAC por reserva
- ingreso atribuido
- margen de contribución
- ROAS, entendido junto con margen y atribución

### Retención

- recompra
- referidos
- reseñas/testimonios

## Fórmulas

`CPL_calificado = gasto_meta / leads_calificados`

`CAC_reserva = gasto_meta / reservas_atribuidas`

`Conversion_chat_reserva = reservas / conversaciones_iniciadas`

`Margen_post_marketing = ingresos - costos_directos - gasto_meta`

`MER = ingresos_totales / gasto_marketing`

## Experimentos prioritarios

### E01 — Transformación vs servicio

**Hipótesis:** un before/after centrado en resultado produce más reservas que una gráfica informativa.

Métrica primaria: CAC por reserva.

### E02 — CTA foto vs CTA genérico

A: “Contáctanos”

B: “Envíanos una foto y cotiza”

Hipótesis: el CTA específico aumenta la finalización del flujo.

### E03 — Dolor vs aspiración

A: mancha / suciedad.

B: sala renovada / lista para disfrutar.

### E04 — Broad vs intereses

Comparar audiencias manteniendo creativo y oferta lo más constantes posible.

### E05 — Respuesta humana rápida

Comparar conversión según tiempo de respuesta: <5 min, 5–30 min, >30 min.

### E06 — Oferta combo

Comparar servicio individual versus combo para evaluar ticket y margen, no solo volumen.

## Instrumentación

Cada lead debe llevar identificadores de origen cuando sea posible:

- campaign_name
- adset_name
- ad_name
- utm_source
- utm_campaign
- utm_content
- click_id / identificador disponible

Además del resultado offline:

- quoted_price
- booked
- booking_date
- revenue
- direct_cost
- lost_reason

## Motivos de pérdida normalizados

- PRICE
- OUT_OF_AREA
- NO_RESPONSE
- NO_PHOTO
- NO_AVAILABILITY
- JUST_RESEARCHING
- COMPETITOR
- SERVICE_NOT_OFFERED
- OTHER

## Dashboard semanal CEO

Debe poder responder en una pantalla:

| KPI | Semana | Semana anterior | Tendencia |
|---|---:|---:|---|
| Gasto Meta | | | |
| Conversaciones | | | |
| Leads calificados | | | |
| Cotizaciones | | | |
| Reservas | | | |
| CAC reserva | | | |
| Ticket promedio | | | |
| Ingreso atribuido | | | |
| Margen post-marketing | | | |

Después:

- ranking de anuncios por CAC,
- ranking de distritos por margen,
- ranking de servicios por ticket,
- motivos de pérdida,
- tiempos de respuesta.

## Regla CEO

Una campaña no recibe más dinero porque Meta reporte un buen costo por conversación. Recibe más dinero cuando los datos del negocio prueban que esas conversaciones terminan en reservas rentables.
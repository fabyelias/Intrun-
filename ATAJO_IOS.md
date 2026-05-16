# Guía: Atajo de iOS para Intrun

## Datos que envía el atajo (JSON completo)

```json
{
  "user_id": "TU_USER_ID",
  "heart_rate": 72,
  "hrv": 45,
  "sleep_hours": 7.5,
  "steps": 4200,
  "stress_pct": 38,
  "spo2": 98,
  "body_temp": 36.4,
  "resp_rate": 14,
  "recorded_at": "2026-05-16T10:00:00.000Z"
}
```

---

## Cómo actualizar el atajo existente

Abrí tu atajo actual en la app **Atajos** y agregá estas acciones ANTES del paso "Obtener contenido de URL":

### Nuevas métricas a capturar de Apple Health

| Métrica | Tipo en Health | Unidad |
|---------|---------------|--------|
| SpO2 | Saturación de oxígeno | % (ej: 98) |
| Temperatura corporal | Temperatura corporal basal | °C (ej: 36.4) |
| Frecuencia respiratoria | Frecuencia respiratoria | rpm (ej: 14) |

### Pasos en la app Atajos

Para **cada** nueva métrica, agregá este bloque:

1. **Buscar muestras de salud**
   - Tipo: (la métrica correspondiente)
   - Ordenar por: Fecha de inicio
   - Orden: Más reciente primero
   - Límite: 1

2. **Obtener [nombre] de Muestras de salud**
   - Seleccioná el resultado del paso anterior
   - Obtener: Valor

3. Guardá ese valor en una variable (ej: `mi_spo2`)

### Diccionario actualizado

En el paso del Diccionario que armás para enviar a Supabase, agregá las 3 claves nuevas:

| Clave | Valor |
|-------|-------|
| `spo2` | Variable `mi_spo2` |
| `body_temp` | Variable `mi_temp` |
| `resp_rate` | Variable `mi_resp` |

---

## Configurar ejecución automática cada hora (iOS Automaciones)

### Opción recomendada — Automaciones por hora

1. Abrí la app **Atajos** → pestaña **Automación**
2. Tocá **+** → **Nueva automación personal**
3. Seleccioná **Hora del día**
4. Configurá una hora (ej: 8:00 AM) → Repetir: **Diariamente**
5. En la siguiente pantalla, agregá la acción: **Ejecutar atajo** → seleccioná tu atajo de Intrun
6. Desactivá "Preguntar antes de ejecutar" → **Listo**
7. **Repetí esto** para cada hora que querés monitorear:

| Hora | Para cubrir |
|------|-------------|
| 07:00 | Al despertar |
| 09:00 | Mañana |
| 11:00 | Media mañana |
| 13:00 | Mediodía |
| 15:00 | Tarde |
| 17:00 | Media tarde |
| 19:00 | Noche temprana |
| 21:00 | Noche |
| 23:00 | Antes de dormir |

Esto da **9 lecturas automáticas por día** sin intervención.

### Nota sobre sueño
La lectura de sueño la capturás al despertar (07:00 AM) con los datos de la noche anterior que Apple Health ya registró.

---

## Tu User ID de Supabase

Lo encontrás en la app Intrun → Perfil → abajo del email aparece tu ID.
O en Supabase Dashboard → Authentication → Users → tu email → UUID.

# Seeding Guide

Guía para ejecutar los scripts de seed y agregar datos a la base de datos.

## Overview

La aplicación usa 4 scripts de seed para poblar la base de datos con:
1. **Grupos musculares, equipos, ejercicios** — datos base
2. **Programas de entrenamiento y sesiones** — estructura
3. **Ejercicios de ExerciseDB API** — ampliación de catálogo
4. **Ejercicios adicionales a sesiones** — enriquecimiento

## Scripts

### 1. `npm run seed` — Datos Base

Crea los datos iniciales:
- 10 grupos musculares (Pecho, Espalda, Piernas, etc)
- 9 equipos (Barra, Mancuernas, Máquina, etc)
- 44 ejercicios locales
- 10 logros (achievements)
- 2 planes de suscripción

**Ejecutar:**
```bash
npm run seed
```

**Output:**
```
🌱 Iniciando seed...
📦 Insertando muscle_groups...
✅ 10 grupos musculares creados
📦 Insertando equipment...
✅ 9 equipos creados
📦 Insertando exercises...
✅ 44 ejercicios creados
...
✅ Seed completado exitosamente!
```

**Tiempo:** ~5 segundos

---

### 2. `npm run seed:programs` — Programas y Sesiones

Crea los 3 programas oficiales con sus sesiones y ejercicios:

**Programas creados:**
- Principiante 3 Días (Full Body A/B/C)
- Hipertrofia 4 Días (Push/Pull/Legs/Upper)
- Fuerza 5×5 (Sesión A/B/C)

**Total:**
- 3 programas
- 10 sesiones
- 55 ejercicios asignados

**Ejecutar:**
```bash
npm run seed:programs
```

**Output:**
```
🌱 Iniciando seed de programas oficiales...
✅ 44 ejercicios encontrados
✅ 3 programas creados
✅ 10 sesiones creadas
✅ 35 días de programa creados
✅ 55 ejercicios por sesión creados

📋 Principiante 3 Días:
   • Lunes:     Full Body A (5 ejercicios, 50 min)
   • Miércoles: Full Body B (5 ejercicios, 50 min)
   • Viernes:   Full Body C (5 ejercicios, 50 min)
```

**Tiempo:** ~10 segundos

---

### 3. `npm run seed:exercises` — ExerciseDB API

Importa ~1500+ ejercicios de ExerciseDB API.

**Datos importados:**
- Nombre, instrucciones, tips, imagen
- Grupo muscular, equipo, dificultad
- external_id (referencia a ExerciseDB)

**Requisitos:**
```bash
# .env
RAPID_API_KEY=your_api_key_here
```

**Obtener API key:**
1. Visita: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
2. Obtén la key (free tier disponible)
3. Agrega a `.env`

**Ejecutar:**
```bash
npm run seed:exercises
```

**Output:**
```
Starting exercise import from ExerciseDB API...
Found 12 muscle groups

Fetching exercises for muscle: chest
  Found 45 exercises
  ✓ Imported 10 exercises...
  ✓ Completed chest

...

========================================
Import complete!
Total imported: 1523
Total skipped: 0
========================================
```

**Tiempo:** 2-3 minutos (primera vez), 30 segundos (subsecuentes)

---

### 4. `npm run seed:add-exercises` — Ejercicios Adicionales

Agrega ejercicios complementarios a cada sesión existente.

**Ejercicios agregados:**
- Full Body A: +2 (Dominadas, Russian twist)
- Full Body B: +2 (Flexiones, Curl femoral)
- Full Body C: +2 (Elevación de piernas, Pantalones de paralelas)
- Push: +3 (Aperturas, Elevaciones frontales, Fondos)
- Pull: +3 (Pullover, Pájaros, Curl en polea)
- Legs: +3 (Peso muerto rumano, Zancadas, Elevación talones)
- Upper: +2 (Jalón al pecho, Elevaciones laterales)
- 5x5 A: +2 (Dominadas, Curl con mancuernas)
- 5x5 B: +2 (Jalón, Extensión tríceps)
- 5x5 C: +2 (Elevaciones laterales, Plancha)

**Ejecutar:**
```bash
npm run seed:add-exercises
```

**Output:**
```
🌱 Agregando más ejercicios a sesiones existentes...

✅ Full Body A: +2 ejercicio(s)
✅ Full Body B: +2 ejercicio(s)
✅ Full Body C: +2 ejercicio(s)
✅ Push — Empuje: +3 ejercicio(s)
✅ Pull — Jale: +3 ejercicio(s)
✅ Legs — Piernas: +3 ejercicio(s)
✅ Upper — Torso: +2 ejercicio(s)
✅ Sesión A: +2 ejercicio(s)
✅ Sesión B: +2 ejercicio(s)
✅ Sesión C: +2 ejercicio(s)

✅ Ejercicios agregados exitosamente!
   • Total agregado: 23 ejercicios
   • Sesiones actualizadas: 10
```

**Tiempo:** ~5 segundos

---

## Sequence of Execution

Orden recomendado para primera vez:

```bash
# 1. Datos base (requerido)
npm run seed

# 2. Programas y sesiones (requerido)
npm run seed:programs

# 3. Opcional: ExerciseDB (requiere RAPID_API_KEY)
npm run seed:exercises

# 4. Ejercicios adicionales (opcional, después de #2)
npm run seed:add-exercises
```

## Database State After Each Script

### After `npm run seed`
```
muscle_groups:     10
equipment:         9
exercises:         44 (local)
achievements:      10
subscription_plans: 2
```

### After `npm run seed:programs`
```
[All from above, plus:]
workout_programs:   3
training_sessions:  10
program_days:       10
session_exercises:  55
```

### After `npm run seed:exercises`
```
[All from above, plus:]
exercises:         44 + 1523 (ExerciseDB) = 1567 total
```

### After `npm run seed:add-exercises`
```
[All from above, plus:]
session_exercises:  55 + 23 = 78 total
```

## Troubleshooting

### "Conexión a Supabase rechazada"
Verificar que `.env` tiene las credenciales correctas:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### "Ejercicio no encontrado: '...'"
El script `seed:programs` depende de que `seed` fue ejecutado primero.
Ejecutar en orden:
```bash
npm run seed
npm run seed:programs
```

### "API Key missing" (seed:exercises)
Agregar a `.env`:
```bash
RAPID_API_KEY=your_rapidapi_key
```

Obtener key en: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb

### "Exercise already exists in session"
Esperable. El script `seed:add-exercises` detecta duplicados y los omite.

### Rate limit exceeded (429)
ExerciseDB free tier: 100 requests/día
Esperar 24 horas o actualizar a plan pago en https://rapidapi.com/dashboard

## Production Deployment

Para producción:

1. **Migrations first:**
   ```bash
   npx supabase db push
   ```

2. **Run seeds in order:**
   ```bash
   npm run seed
   npm run seed:programs
   ```

3. **Optional - ExerciseDB** (requiere RapidAPI key):
   ```bash
   npm run seed:exercises
   ```

4. **Optional - Additional exercises:**
   ```bash
   npm run seed:add-exercises
   ```

## Modifying Seeds

Para agregar o modificar ejercicios en una sesión, editar:
- `scripts/seed.js` — ejercicios base
- `scripts/seed-programs.js` — asignaciones a sesiones
- `scripts/add-exercises-to-sessions.js` — ejercicios complementarios

Luego ejecutar el script correspondiente.

## Resetting Database

Para limpiar y empezar de nuevo:

```bash
# 1. En Supabase Dashboard: SQL Editor
DELETE FROM session_exercises;
DELETE FROM program_days;
DELETE FROM training_sessions;
DELETE FROM workout_programs;
DELETE FROM user_programs;
DELETE FROM exercises;
DELETE FROM equipment;
DELETE FROM muscle_groups;
DELETE FROM achievements;
DELETE FROM subscription_plans;

# 2. Luego ejecutar seeds en orden:
npm run seed
npm run seed:programs
npm run seed:exercises
npm run seed:add-exercises
```

## Performance Notes

- `seed` — muy rápido, datos estáticos
- `seed:programs` — rápido, ~50 registros
- `seed:exercises` — lento, 1500+ llamadas API (2-3 min)
- `seed:add-exercises` — muy rápido, ~23 registros

Se pueden ejecutar en paralelo `seed` + `seed:programs` en una misma línea.
`seed:exercises` debe ejecutarse por separado por el volumen de APIs.

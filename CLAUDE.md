# CLAUDE.md

## Propósito del proyecto

Esta es una aplicación móvil de entrenamiento desarrollada con React Native y Expo.

Antes de realizar cualquier cambio, leer la documentación ubicada en la carpeta `/docs`.

La documentación es la fuente de verdad del proyecto.

Si existe una contradicción entre el código y la documentación, solicitar aclaración antes de continuar.

---

## Tecnologías autorizadas

Frontend

* Expo
* React Native
* TypeScript
* Expo Router

Backend

* Supabase

Base de datos

* PostgreSQL

Gestión de estado

* Zustand

Gestión de datos del servidor

* TanStack Query (React Query)

Formularios

* React Hook Form

Validaciones

* Zod

Testing

* Jest
* React Native Testing Library

No incorporar nuevas tecnologías o dependencias importantes sin aprobación explícita.

---

## Flujo de trabajo obligatorio

Antes de implementar una funcionalidad:

1. Leer la documentación relevante.
2. Analizar el impacto de los cambios.
3. Identificar los archivos afectados.
4. Explicar el plan de implementación.
5. Realizar los cambios.
6. Verificar posibles regresiones.

No modificar código sin comprender previamente el contexto funcional y técnico.

---

## Reglas de arquitectura

Mantener la separación de responsabilidades.

* Las pantallas pertenecen a `app/`
* Los componentes reutilizables pertenecen a `components/`
* La lógica específica de una funcionalidad pertenece a `features/`
* El acceso a APIs y servicios externos pertenece a `services/`
* Los hooks personalizados pertenecen a `hooks/`
* Los tipos compartidos pertenecen a `types/`
* Los recursos estáticos pertenecen a `assets/`

Evitar colocar lógica de negocio dentro de componentes visuales.

La lógica de negocio debe mantenerse desacoplada de la interfaz.

---

## Estándares de código

* Utilizar TypeScript estricto.
* Preferir componentes funcionales.
* Preferir composición sobre herencia.
* Evitar duplicación de código.
* Mantener funciones pequeñas y legibles.
* Utilizar nombres descriptivos.
* Evitar números mágicos.
* Evitar valores hardcodeados cuando deban configurarse.
* Priorizar mantenibilidad y claridad.

Todo código generado debe estar preparado para producción.

---

## Gestión de estado

* Utilizar Zustand para estado global.
* Mantener el estado local cuando sea posible.
* Evitar estados globales innecesarios.
* No duplicar información entre stores.

---

## Base de datos

Toda modificación de esquema requiere:

* Migración SQL.
* Actualización de documentación.
* Actualización de tipos TypeScript.

No eliminar tablas o columnas sin justificación explícita.

Respetar las relaciones definidas en `docs/02-architecture/database.md`.

---

## Interfaz de usuario

La aplicación debe ser:

* Mobile First.
* Responsive.
* Accesible.
* Compatible con modo oscuro.
* Consistente visualmente.

Mantener coherencia con el sistema de diseño definido en la documentación.

Evitar estilos duplicados.

Priorizar componentes reutilizables.

---

## Rendimiento

* Evitar renders innecesarios.
* Optimizar listas extensas.
* Utilizar memoización cuando aporte valor.
* Minimizar llamadas de red innecesarias.
* Cargar datos de forma eficiente.

---

## Manejo de errores

Todo flujo importante debe contemplar:

* Estado de carga.
* Estado de error.
* Estado vacío.
* Reintentos cuando corresponda.

Los errores deben ser registrados y mostrados de forma amigable para el usuario.

---

## Testing

Para funcionalidades importantes generar:

* Tests unitarios.
* Tests de componentes cuando corresponda.

Evitar código sin posibilidad de prueba.

---

## Documentación

Cuando se agregue una funcionalidad significativa:

* Actualizar documentación relacionada.
* Mantener sincronizados código y documentación.

Nunca asumir reglas de negocio que no estén documentadas.

Ante dudas, solicitar aclaración.

---

## Formato esperado de las respuestas

Cuando se implemente una funcionalidad:

1. Explicar brevemente el objetivo.
2. Describir la estrategia elegida.
3. Indicar archivos modificados.
4. Implementar la solución.
5. Explicar decisiones técnicas relevantes.
6. Informar riesgos o mejoras futuras.

Generar siempre soluciones completas y listas para producción.

---

## ExerciseDB API Integration

### Overview

Ejercicios importados desde ExerciseDB con videos bajo-demanda:

- **Datos**: Nombre, instrucciones, tips, imagen, músculo, equipo almacenados en `exercises` table
- **Videos**: Obtenidos en vivo desde ExerciseDB usando `external_id` (referencia a exerciseId de la API)
- **Fallback**: Si la API falla, se muestran instrucciones + tips en texto

### Setup

1. Obtener API key en: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
2. Agregar a `.env`: `RAPID_API_KEY=your_key`
3. Ejecutar: `npm run seed:exercises`
4. Agregar a `app.json`: `EXPO_PUBLIC_RAPID_API_KEY` en `expo.extra`

### Key Files

- `docs/EXERCISE_VIDEO_ARCHITECTURE.md` — Arquitectura completa
- `docs/EXERCISEDB_SETUP.md` — Setup detallado
- `src/api/exercise-video.ts` — API calls a ExerciseDB
- `src/hooks/use-exercise-video.ts` — React Query hook
- `src/components/training/ExerciseVideoDisplay.tsx` — Componente UI
- `scripts/seed-exercises-from-api.js` — Script de importación
- `supabase/migrations/20260615000003_*.sql` — Cambios al esquema

### Database Schema

`exercises` table cambios:
- ✅ AGREGADO: `external_id` (referencia a ExerciseDB)
- ✅ AGREGADO: `tips` (cues/consejos)
- ❌ REMOVIDO: `video_url` (obtenido on-demand)

---

## Seed Scripts

### Available Scripts

```bash
npm run seed                  # Datos base (muscle_groups, equipment, exercises, etc)
npm run seed:programs         # Programas y sesiones (3 programas + 10 sesiones)
npm run seed:exercises        # ExerciseDB (~1500+ ejercicios, requiere RAPID_API_KEY)
npm run seed:add-exercises    # Ejercicios adicionales a sesiones (23 ejercicios)
```

### Recommended Order

```bash
npm run seed              # Requerido primero
npm run seed:programs     # Depende de seed
npm run seed:exercises    # Opcional, requiere API key
npm run seed:add-exercises # Opcional, depende de seed:programs
```

### Database State

- **After seed**: 44 ejercicios locales, 10 grupos musculares
- **After seed:programs**: 3 programas, 10 sesiones, 55 ejercicios asignados
- **After seed:exercises**: +1523 ejercicios de ExerciseDB
- **After seed:add-exercises**: +23 ejercicios complementarios a sesiones

Ver `docs/SEEDING_GUIDE.md` para detalles completos.

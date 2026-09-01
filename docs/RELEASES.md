# Releases (Android)

## Overview

Los builds se hacen con **EAS Build** (servicio cloud de Expo) — no hace falta Android Studio ni un SDK de Android instalado localmente. Por ahora solo Android, con el objetivo de publicar en Play Store. iOS se puede agregar después con el mismo patrón (bundle identifier + perfiles equivalentes en `eas.json`).

## Prerequisitos

1. **Cuenta de Expo + `eas login`** — login interactivo, una vez por máquina:
   ```bash
   npx eas-cli login
   ```

2. **Cuenta de Google Play Console** — pago único de USD $25. Esto es 100% manual, en https://play.google.com/console.

3. **Service account de Google Cloud** (para que `eas submit` pueda subir builds automáticamente):
   - Crear un proyecto en Google Cloud Console (o reusar uno existente).
   - Crear una service account con permisos de "Service Account User".
   - En Play Console → **Users and permissions → API access**, vincular esa service account y darle permiso de "Release apps to testing tracks" como mínimo.
   - Generar una clave JSON para esa service account y guardarla en la raíz del proyecto como `google-service-account.json` (ya está en `.gitignore` — **nunca la commitees**).

4. **Gotcha importante**: la API de Google Play **no puede crear un listing nuevo**. Antes de que `eas submit` funcione por primera vez, hay que crear la app manualmente en Play Console: título, `com.abelangelok.trainingapp` como package name, categoría, y completar las declaraciones obligatorias de "App content" (privacidad, clasificación de contenido, etc.).

## Vinculación del proyecto EAS (una sola vez)

```bash
npx eas-cli init
```

Usar `eas init`, **no** `eas build:configure` — este último regenera/mergea `eas.json` de forma interactiva y podría pisar los perfiles ya definidos a mano en este repo. `eas init` solo vincula el proyecto a tu cuenta y escribe `extra.eas.projectId` en la config de la app.

## Variables de entorno en EAS (crítico, antes del primer build)

`.env` está gitignored — los workers de EAS Build clonan el repo desde git y **no lo ven**. Sin este paso, el build compila pero la app crashea al abrir con "supabaseUrl is required".

```bash
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://tu-proyecto.supabase.co" --visibility plaintext
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu-anon-key" --visibility sensitive

npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://tu-proyecto.supabase.co" --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "tu-anon-key" --visibility sensitive
```

Los nombres de entorno (`preview`, `production`) calzan con los perfiles de build en `eas.json`, así que EAS los asocia automáticamente sin configuración extra.

- `EXPO_PUBLIC_FITGIFS_API_URL` — **no hace falta configurarla**, tiene un fallback hardcodeado en `src/api/exercise-gif.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` / `RAPID_API_KEY` — son server-only, usadas solo por los scripts de seed en tu máquina. Nunca van en EAS ni se bundlean en la app.

## Keystore de Android

Nada que hacer. EAS genera y gestiona el keystore de firma automáticamente en el primer build (administrable después con `eas credentials` si hace falta).

## Comandos

```bash
npm run build:android:preview   # APK de distribución interna, para instalar en un dispositivo de prueba
npm run build:android           # AAB de producción, para Play Store
npm run submit:android          # Sube el último build de producción a Play Console (track Internal Testing, como Draft)
```

Cada build consume minutos de cuota de tu plan de EAS — revisar los límites vigentes en https://expo.dev/pricing antes de compilar repetidamente.

## Versionado

| Qué | Cómo | Quién/cuándo |
|---|---|---|
| `expo.version` (semver humano, ej. "1.0.0") | Edición manual en `app.json` (patch/minor/major) | Antes de cada release a Play Store |
| Android `versionCode` | 100% automático (`appVersionSource: remote` + `autoIncrement` en el perfil `production` de `eas.json`) | EAS, en cada `eas build --profile production` — cero bookkeeping manual |
| Trazabilidad commit↔release | Tag de git `vX.Y.Z` en el commit que se publicó | Inmediatamente después de un `submit:android` exitoso |
| Historial de cambios | `CHANGELOG.md` (formato Keep a Changelog) — una entrada por versión que llega a Play Store, no por cada build de prueba | Al bumpear `expo.version` |

`expo.version` y `versionCode` viven en lugares distintos (uno en git, el otro en los servidores de EAS) y no interactúan entre sí.

## Troubleshooting

**Ver el versionCode actual sin hacer un build:**
```bash
npx eas-cli build:version:get --platform android
```

**"No app found" o error similar al hacer `eas submit` por primera vez**: revisar el gotcha de la sección de prerequisitos — hay que crear el listing de la app a mano en Play Console antes de que `eas submit` pueda subir nada.

**La app crashea al abrir con "supabaseUrl is required"**: faltan las variables de entorno en EAS — repetir el paso de `eas env:create` para el entorno correspondiente (`preview` o `production`) y volver a compilar.

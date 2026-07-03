# Stack Tecnológico

## Objetivo

La aplicación debe funcionar en Android e iOS desde una única base de código.

Debe ser compatible con Google Play Store y Apple App Store.

---

# Frontend

## Framework

* Expo
* React Native
* TypeScript

## Navegación

* Expo Router

## Gestión de Estado

* Zustand

## Gestión de Datos del Servidor

* TanStack Query (React Query)

## Formularios

* React Hook Form

## Validaciones

* Zod

## Animaciones

* React Native Reanimated

## Manejo de Fechas

* date-fns

---

# Backend

## Plataforma

* Supabase

## Funcionalidades utilizadas

* Authentication
* PostgreSQL Database
* Storage
* Edge Functions (cuando sea necesario)
* Realtime (futuro)

---

# Base de Datos

## Motor

* PostgreSQL (Supabase)

## Acceso

* Supabase Client

## Migraciones

* SQL migrations versionadas

---

# Autenticación

Métodos soportados:

* Email y contraseña
* Google Sign-In

Métodos futuros:

* Apple Sign-In

---

# Monetización

## Suscripciones

* Plan mensual
* Plan anual

## Plataformas

* Google Play Billing
* Apple In-App Purchases

La validación de suscripciones debe realizarse en el backend.

---

# Rankings

Los rankings se calcularán utilizando información almacenada en PostgreSQL.

Se soportarán rankings:

* Globales
* Por país
* Por provincia
* Por ciudad
* Entre amigos

---

# Integraciones de Salud

Integraciones futuras:

* Health Connect
* Apple Health
* Garmin
* Fitbit
* Samsung Health

Estas integraciones serán utilizadas para registrar actividad física y kilómetros recorridos.

---

# Testing

## Unit Testing

* Jest

## Component Testing

* React Native Testing Library

---

# Calidad de Código

* ESLint
* Prettier

---

# Control de Versiones

* Git

Repositorio principal:

* GitHub

---

# Distribución

## Android

* Google Play Store

## iOS

* Apple App Store

---

# Restricciones Técnicas

No incorporar nuevas tecnologías sin aprobación.

Priorizar soluciones compatibles con Expo.

Evitar dependencias que requieran eject salvo necesidad justificada.

Mantener compatibilidad con Android e iOS.

# Las Edge Functions serán responsables de:

- Rankings globales
- Rankings de amigos
- Estadísticas agregadas
- Validación de suscripciones
- Compras futuras del marketplace
- Operaciones administrativas
- Integraciones externas
- Procesamiento de métricas

# Arquitectura

La plataforma seguirá un enfoque API-First.

Toda funcionalidad del negocio deberá estar disponible mediante APIs.

La aplicación móvil será un consumidor de dichas APIs.

La lógica de negocio no deberá depender exclusivamente de la aplicación móvil.

La arquitectura deberá permitir incorporar en el futuro:

- Aplicación Web
- Portal de Administradores
- Portal para Coaches
- Integraciones con terceros
- Automatizaciones
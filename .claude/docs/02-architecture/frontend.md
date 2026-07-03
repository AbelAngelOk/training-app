# Frontend Architecture

## Purpose

This document defines the frontend architecture of the application.

The objective is to maintain a scalable, maintainable and predictable codebase that supports future growth.

The frontend must consume backend APIs and should not contain critical business logic.

---

# Technology Stack

## Framework

* React Native
* Expo
* TypeScript

---

## Routing

* Expo Router

Navigation must be file-system based.

Avoid custom navigation implementations unless strictly necessary.

---

## State Management

* Zustand

Use Zustand only for:

* Authentication state
* User state
* Theme state
* Application settings
* Temporary global UI state

Do not use Zustand as a server cache.

---

## Server State

* TanStack Query (React Query)

Responsibilities:

* API requests
* Data caching
* Synchronization
* Pagination
* Mutations

All backend communication should be handled through React Query.

---

## Forms

* React Hook Form

Responsibilities:

* Form state
* Validation integration
* Error handling

---

## Validation

* Zod

Responsibilities:

* Input validation
* API payload validation
* Form validation

All forms should use Zod schemas.

---

## Date Management

* date-fns

Used for:

* Calendar
* Workout history
* Statistics
* Ranking dates

---

## Animations

* React Native Reanimated

Use only when animations improve UX.

Avoid unnecessary animations.

---

# Project Structure

```text
app/
├── (auth)/
├── (tabs)/
├── program/
├── session/
├── workout/
├── rankings/
├── friends/
├── profile/
├── premium/
└── settings/

src/
├── api/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── utils/
└── constants/
```

---

# Feature Organization

Features should be isolated.

Example:

```text
src/features/workouts/

├── api/
├── components/
├── hooks/
├── screens/
├── types/
├── utils/
└── schemas/
```

Avoid large shared folders when feature ownership is clear.

---

# API Layer

## Responsibilities

The API layer is responsible for:

* Requests
* Responses
* Error handling
* Authentication headers

Location:

```text
src/api/
```

Example:

```text
src/api/workouts.ts
src/api/programs.ts
src/api/rankings.ts
```

---

# Services Layer

## Responsibilities

Services encapsulate reusable business interactions.

Examples:

```text
WorkoutService
RankingService
FriendshipService
SubscriptionService
```

Location:

```text
src/services/
```

---

# State Stores

## Zustand Stores

Location:

```text
src/stores/
```

Examples:

```text
auth-store.ts
user-store.ts
theme-store.ts
settings-store.ts
```

Rules:

* Keep stores small.
* Avoid server data persistence.
* Prefer React Query for backend data.

---

# React Query

## Query Keys

All query keys should be centralized.

Location:

```text
src/constants/query-keys.ts
```

Example:

```typescript
export const QUERY_KEYS = {
  USER: ["user"],
  PROGRAMS: ["programs"],
  WORKOUTS: ["workouts"],
  RANKINGS: ["rankings"],
};
```

---

# UI Components

## Shared Components

Location:

```text
src/components/
```

Examples:

```text
Button
Input
Avatar
Card
Modal
Loader
EmptyState
```

Shared components should be reusable and presentation-focused.

---

# Feature Components

Feature-specific components belong inside their feature folder.

Example:

```text
features/workouts/components/
```

---

# Forms

All forms must:

* Use React Hook Form.
* Use Zod validation.
* Display validation errors.
* Support loading states.

---

# Error Handling

All screens must handle:

* Loading state
* Empty state
* Error state

Avoid blank screens.

---

# Authentication Flow

## Public Screens

Available without authentication:

* Login
* Register
* Forgot Password

---

## Protected Screens

Require authentication:

* Home
* Programs
* Sessions
* Workouts
* Rankings
* Friends
* Profile

---

# Main Navigation

## Bottom Tabs

The application has four tabs in this order:

| Position | Name | Icon | Route |
|---|---|---|---|
| 1 | Entrenamiento | Dumbbell | /training |
| 2 | Explorar | Compass | /explore |
| 3 | Rankings | Trophy | /rankings |
| 4 | Perfil | User | /profile |

### Entrenamiento (Tab 1)

Main screen. Dashboard summary (next session, current streak) and weekly training sessions list.

Route: `/training`

---

### Explorar (Tab 2)

Browse official programs and sessions. Future marketplace.

Route: `/explore`

---

### Rankings (Tab 3)

Rankings by hours trained and weight lifted. Scoped by friends, city, province, country and global.

Route: `/rankings`

---

### Perfil (Tab 4)

User profile, lifetime statistics, activity calendar, achievements and subscription management.

Route: `/profile`

---

# Home Screen

Responsibilities:

* Welcome user
* Show next workout
* Show current streak
* Show quick statistics
* Show active program

---

# Program Screen

Responsibilities:

* View active program
* View weekly schedule
* Change program
* Edit personal program (premium)

---

# Workout Screen

Responsibilities:

* Start workout
* Resume workout
* View workout history

---

# Rankings Screen

Responsibilities:

* Global rankings
* Country rankings
* Province rankings
* City rankings
* Friend rankings

---

# Profile Screen

Responsibilities:

* User information
* Lifetime statistics
* Achievements
* Calendar
* Subscription status

---

# Premium Features

Premium-only screens must:

* Display access restrictions.
* Show upgrade options.

Never hide functionality completely.

Users should understand what premium unlocks.

---

# Theme System

Support:

* Light mode
* Dark mode

Future themes should be possible without refactoring.

---

# Performance Rules

Avoid unnecessary re-renders.

Use:

* React.memo
* useMemo
* useCallback

Only when justified by profiling.

Do not optimize prematurely.

---

# Accessibility

All screens should support:

* Screen readers
* Dynamic font sizes
* Proper touch targets

---

# Offline Strategy

Initial MVP:

* Limited offline support.

Future:

* Offline workout execution.
* Synchronization when online.

The architecture should allow future offline-first implementation.

---

# Testing

## Unit Tests

Use:

* Jest

---

## Component Tests

Use:

* React Native Testing Library

---

# Frontend Rules

1. Business logic belongs in backend services.
2. UI should remain as simple as possible.
3. Server state belongs to React Query.
4. Global state belongs to Zustand.
5. Forms must use React Hook Form and Zod.
6. Features should remain isolated.
7. Components should be reusable.
8. Navigation should use Expo Router.
9. Every screen must support loading, error and empty states.
10. All API communication must pass through the API layer.

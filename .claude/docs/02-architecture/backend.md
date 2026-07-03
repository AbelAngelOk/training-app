# Backend Architecture

## Purpose

This document defines the backend architecture of the platform.

The backend must follow an API-First approach and be capable of supporting multiple clients:

* Mobile App (React Native)
* Future Web App
* Future Coach Portal
* Future Admin Portal
* Future Third-Party Integrations

The mobile application must never be considered the source of truth.

Business rules must be enforced by backend services.

---

# Architectural Principles

## API First

All business capabilities must be exposed through APIs.

No business process should depend exclusively on the mobile application.

Future applications must be able to reuse the same backend without modifications.

---

## Backend as Source of Truth

The backend is responsible for:

* User permissions
* Subscription validation
* Rankings
* Statistics
* Achievements
* Friendships
* Workout history

The frontend is responsible only for:

* User Interface
* User Experience
* Navigation
* Local state
* API consumption

---

## Security First

Sensitive operations must never rely on client-side validation.

All critical validations must be executed in backend services.

---

# Technology Stack

## Backend Platform

Supabase

Services used:

* PostgreSQL
* Authentication
* Storage
* Realtime
* Edge Functions

---

## Database

PostgreSQL

Responsibilities:

* Persistent storage
* Relationships
* Constraints
* Indexes
* Views
* Policies

---

## Authentication

Supabase Auth

Supported providers:

* Email + Password
* Google Sign-In

Future providers:

* Apple Sign-In

Authentication must be centralized.

---

## Storage

Supabase Storage

Used for:

* Profile images
* Exercise images
* Exercise videos
* Future marketplace assets

---

## Realtime

Supabase Realtime

Future usage:

* Chats
* Notifications
* Live ranking updates
* Coach monitoring

---

# Edge Functions

## Purpose

Edge Functions are responsible for business logic that should not live in the mobile application.

---

## Ranking Functions

Responsibilities:

* Generate global rankings
* Generate country rankings
* Generate province rankings
* Generate city rankings
* Generate friend rankings

Only premium users should appear in global rankings.

---

## Statistics Functions

Responsibilities:

* Update user statistics
* Calculate total weight lifted
* Calculate total training hours
* Calculate total distance traveled
* Calculate streaks

---

## Achievement Functions

Responsibilities:

* Detect achievement completion
* Unlock achievements
* Generate notifications

---

## Subscription Functions

Responsibilities:

* Validate purchases
* Verify subscriptions
* Update premium status
* Process renewals

Must integrate with:

* Google Play Billing
* Apple In-App Purchases

---

## Health Integration Functions

Responsibilities:

* Sync activity data
* Import distance records
* Validate provider connections
* Update statistics

Supported providers:

* Health Connect
* Apple Health
* Garmin
* Fitbit
* Samsung Health

---

## Friendship Functions

Responsibilities:

* Send requests
* Accept requests
* Remove friendships
* Generate friend rankings

---

# API Design

## General Rules

All APIs must be versioned.

Example:

```text
/api/v1
```

Future versions:

```text
/api/v2
```

---

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

# Core Domains

The backend is organized around the following domains.

---

## Authentication

Responsibilities:

* Login
* Registration
* Session management
* Password recovery

---

## Users

Responsibilities:

* Profile management
* Preferences
* Location management

---

## Programs

Responsibilities:

* Official programs
* Personal programs
* Program duplication
* Program assignment

---

## Sessions

Responsibilities:

* Official sessions
* Personal sessions
* Session duplication
* Session management

---

## Exercises

Responsibilities:

* Exercise catalog
* Exercise media
* Categories
* Equipment

---

## Workouts

Responsibilities:

* Workout execution
* Set tracking
* History generation
* Progress tracking

---

## Calendar

Responsibilities:

* Session scheduling
* Session status
* Calendar generation

---

## Statistics

Responsibilities:

* Lifetime statistics
* Progress metrics
* Aggregations

---

## Rankings

Responsibilities:

* Global rankings
* Regional rankings
* Friend rankings

---

## Social

Responsibilities:

* Friend requests
* Friendships
* Future social features

---

## Subscriptions

Responsibilities:

* Plans
* Payments
* Access control

---

## Achievements

Responsibilities:

* Achievement definitions
* Unlocking
* Progress tracking

---

# Authorization

## Roles

Supported roles:

* free_user
* premium_user
* coach
* admin

---

## Permissions

Free User:

* Access official programs
* Execute workouts
* View global rankings
* Participate in friend rankings

Premium User:

* Create personal programs
* Create personal sessions
* Participate in global rankings

Coach:

* All premium permissions
* Client management

Admin:

* Full platform access

---

# Data Ownership

## Official Content

Official content belongs to the platform.

Examples:

* Programs
* Sessions
* Exercises

Users cannot modify official content.

---

## Personal Content

Personal content belongs to its creator.

Examples:

* Personal programs
* Personal sessions

Users can modify their own content.

---

## Duplication Model

When a user customizes official content:

1. A copy is created.
2. Ownership is assigned to the user.
3. The original content remains unchanged.

---

# Background Jobs

Future scheduled jobs:

* Ranking recalculation
* Statistics recalculation
* Achievement processing
* Subscription verification
* Health synchronization

These jobs may run through:

* Scheduled Edge Functions
* Supabase Cron Jobs

---

# Monitoring

The backend should provide:

* Structured logs
* Error tracking
* Performance metrics

Critical events:

* Login failures
* Subscription failures
* Ranking generation failures
* Health sync failures

---

# Future Modules

Not part of MVP but must be considered.

## Coach Portal

* Client management
* Workout assignment
* Progress tracking

---

## Chat System

* Direct messages
* Coach communication
* Realtime updates

---

## Marketplace

* Program publishing
* Program purchases
* Revenue tracking

---

# Backend Rule

Any business rule that may be required by:

* Mobile App
* Web App
* Coach Portal
* Admin Portal

must be implemented in backend services and never exclusively in frontend code.

# Screens

## Purpose

This document defines all user-facing screens of the application and the expected behavior of each screen.

The goal is to provide a single source of truth for frontend implementation.

---

# Navigation Structure

## Authentication Flow

* Welcome Screen
* Login Screen
* Register Screen

---

## Main Application

Bottom Navigation (in order):

* Entrenamiento — /training
* Explorar — /explore
* Rankings — /rankings
* Perfil — /profile

Floating Action Button (Entrenamiento tab only):

* Create Program [Premium]
* Create Session [Premium]

---

# Welcome Screen

## Purpose

Application presentation and entry point.

---

## Content

* Application logo
* Application name
* Marketing message
* Login button
* Register button

---

## Actions

* Login
* Register

---

# Login Screen

## Purpose

Authenticate user.

---

## Content

* Email
* Password
* Login button
* Google Login

---

# Register Screen

## Purpose

Create account.

---

## Content

* Name
* Email
* Password
* Confirm password

---

# Forgot Password Screen

## Purpose

Recover account access via email link.

Accessible from: Login Screen.

---

## Content

* Email field
* Send recovery link button

---

## Actions

* Send recovery email

---

# Training Screen

## Purpose

Main screen of the application.

Displays scheduled sessions.

Accessible from bottom navigation.

---

## Content

List of weekly sessions.

Each session is displayed as a card.

Card content:

* Background image
* Session title
* Status
* Play button

---

## Session Status

Possible states:

### Pending

Scheduled and not started.

---

### Completed

Successfully completed.

---

### Late

Scheduled but not completed.

---

## Actions

* Open session
* Create program
* Create session

---

## Floating Action Button

Expands:

* Create Program
* Create Session

---

# Session Screen

## Purpose

Display activities belonging to a session.

---

## Content

List of activities.

Each activity displays:

* Name
* Status
* Progress

---

## Activity Status

### Pending

Not completed.

### Completed

Completed successfully.

### Cancelled

Skipped by the user.

---

## Actions

* Start entire session
* Start individual activity
* Continue session
* Cancel activity

---

# Activity Screen

## Purpose

Execute a specific activity.

This is the most important screen of the application.

---

## Visual Style

Inspired by social media reels.

Full screen experience.

Vertical layout.

Large video area.

Minimal distractions.

---

## Content

* Exercise video
* Exercise name
* Series indicator
* Repetition indicator
* Timer
* Rest timer
* Progress indicator

---

# Activity Types

## Type 1

Repetition-Based Activities

Examples:

* Bench Press
* Squat
* Pull Up

Behavior:

User manually confirms completion.

When completed:

* Rest timer starts automatically.

When rest finishes:

* Next set starts automatically.

When final set finishes:

* Next activity starts automatically.

---

## Type 2

Time-Based Activities

Examples:

* Plank
* Wall Sit
* Running Intervals

Behavior:

Timer starts automatically.

When timer ends:

* Rest timer starts automatically.

When rest finishes:

* Next set starts automatically.

When final set finishes:

* Next activity starts automatically.

---

# Post-Workout Summary Screen

## Purpose

Display workout results upon session completion.

Shown automatically when the last activity of a session is completed.

Full screen. Bottom navigation hidden.

---

## Content

* Session name
* Total duration
* Total completed sets
* Total weight lifted in the session
* Updated streak
* Completion message

---

## Actions

* Return to Training Screen

---

# Create Program Screen

## Purpose

Create a personal workout program.

Premium feature.

---

## Content

* Program name
* Description
* Weekly schedule
* Session assignments

---

## Actions

* Save
* Publish

---

# Create Session Screen

## Purpose

Create a personal session.

Premium feature.

---

## Content

* Session name
* Description
* Exercise selection
* Series
* Repetitions
* Weight
* Rest

---

## Actions

* Save
* Publish

---

# Publish Content Screen

## Purpose

Publish a program or session.

---

## Content

* Title
* Description
* Visibility

Visibility options:

* Private
* Public Free
* Public Paid

---

## Paid Content

When paid is selected:

Additional fields:

* Price
* Category

---

## Chat Configuration

Paid publications automatically create a discussion channel.

Owners and users with access can participate.

---

# Discover Screen

## Purpose

Browse public content.

---

## Content

Search bar.

Filters.

Categories.

Popular content.

Recent content.

---

## Search Targets

* Programs
* Sessions

---

## Filters

* Free
* Paid
* Beginner
* Intermediate
* Advanced

---

## Actions

* View details
* Add to personal library
* Purchase content

---

# Program Details Screen

## Purpose

Display details of a public program.

---

## Content

* Cover image
* Description
* Sessions included
* Author
* Rating
* Reviews

---

## Actions

* Add to my programs
* Purchase

---

# Session Details Screen

## Purpose

Display details of a public session.

---

## Content

* Cover image
* Description
* Activities included
* Author

---

## Actions

* Add to my sessions
* Purchase

---

# Rankings Screen

## Purpose

Display rankings.

Accessible from bottom navigation.

---

## Ranking Types

* Training Hours
* Weight Lifted
* Distance Traveled

---

## Scopes

* Friends
* City
* Province
* Country
* Global

---

## Restrictions

Global rankings require Premium participation.

Free users can view but not participate.

---

# Profile Screen

## Purpose

Display user information and progress.

Accessible from bottom navigation.

---

## Header

* Avatar
* User name
* Membership status

---

## Statistics

* Total hours trained
* Total weight lifted
* Total distance traveled
* Completed sessions

---

## Calendar

Displays:

* Scheduled sessions
* Completed sessions
* Missed sessions

Different visual indicators for each state.

---

## Streak Section

Future feature.

Displays:

* Current streak
* Best streak

---

## Actions

* Edit profile
* Manage subscription
* Settings

---

# Chat Screen

## Purpose

Discussion area associated with paid content.

Future feature.

---

## Content

* Message list
* Message input
* Attachments

---

## Access

Only available to:

* Content creator
* Users with access to the content

---

# Subscription Screen

## Purpose

Manage premium access.

---

## Content

Premium benefits.

Available plans:

* Monthly
* Yearly

---

## Actions

* Subscribe
* Renew
* Restore purchase

---

# Settings Screen

## Purpose

Manage application settings.

---

## Content

* Theme
* Notifications
* Connected devices
* Account settings
* Logout

---

# Edit Profile Screen

## Purpose

Edit user profile information.

---

## Content

* Display name
* Avatar (camera or gallery)
* City
* Province
* Country

---

## Actions

* Save changes

---

# Achievements Screen

## Purpose

Display all available and unlocked achievements.

---

## Content

Unlocked achievements:

* Achievement name
* Description
* Unlock date

Pending achievements:

* Achievement name
* Description
* Current progress toward unlock

---

# Paywall Screen

## Purpose

Display premium benefits and subscription options.

Shown as a modal when a free user attempts to access a premium feature.

Can be triggered from any screen or tab.

---

## Content

* Name of the premium feature being accessed (contextual)
* List of premium benefits
* Available plans: Monthly and Yearly with pricing

---

## Actions

* Subscribe Monthly
* Subscribe Yearly
* Dismiss (return to previous screen)

---

## Rule

Premium functionality must never be completely hidden from free users.

Always communicate what is unlocked by Premium.

---

# UI Principles

1. Training execution must require the minimum number of taps possible.
2. The activity screen is the primary experience of the application.
3. Videos should always be prioritized during activity execution.
4. Statistics must be easily accessible.
5. Navigation should be simple and predictable.
6. Public content discovery should be frictionless.
7. Mobile-first design is mandatory.

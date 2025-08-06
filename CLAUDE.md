# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 PWA for running Americano padel tournaments. The app provides a mobile-friendly interface for tournament organizers to set up sessions, generate fair matches, track scores, and view standings. All data is stored locally using Zustand with localStorage persistence.

## Key Technologies

- **Framework**: Next.js 15 with App Router and Turbopack
- **State Management**: Zustand with persist middleware
- **Styling**: TailwindCSS v4
- **Storage**: localStorage via Zustand persist
- **Compression**: lz-string for session sharing
- **Utilities**: nanoid for ID generation

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Core State Structure
The app centers around a Zustand store managing sessions with this structure:
- **Session**: Contains fields count, points per game, players, matches, and metadata
- **Player**: Has name, games played count, and total points
- **Match**: Represents a 2v2 game with teams, scores, and round number

### Match Generation Algorithm
The fairness-first algorithm:
1. Selects 4 players with fewest games played
2. Evaluates all possible 2v2 team combinations
3. Scores based on games played, teammate repeats, and opponent repeats
4. Ensures ±1 game difference maximum between players

### User Flow
1. **Homepage**: Lists existing sessions + create new session button
2. **Creation Flow**: Guided 3-step setup (fields → points per game → players)
3. **Session Page**: Two tabs (Match management and Results/standings)

### File Structure
- `src/app/` - Next.js app router pages
- Session state managed via Zustand store
- Match generation algorithm in separate utility
- Share/import functionality using URL fragments with compressed data

## Development Notes

- Uses TypeScript with strict mode enabled
- Tailwind CSS for styling with Geist font family
- Mobile-first responsive design approach
- No external API dependencies - fully client-side
- PWA-ready for offline functionality

## Key Features to Understand

- **Persistence**: All sessions auto-save to localStorage
- **Fairness Algorithm**: Ensures balanced gameplay across all participants
- **Score Entry**: Fast tap-based modal interface
- **Session Sharing**: Optional export/import via compressed URLs
- **Offline Support**: Works without internet connection

The PRD document in `/plan/americano_padel_prd.md` contains comprehensive feature specifications and technical requirements.

## Code Guidelines

- Always use descriptive variable names

## Development Restrictions

- Don't commit to github unless I tell you

## Technology Constraints

- Always use Tailwind V4, no V3

## Component Guidelines

- Use shadcn components, install if you have to
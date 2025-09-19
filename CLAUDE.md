# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QRF Agent Performance Dashboard - a React-based single-page application for call center workforce analytics. The dashboard provides comprehensive agent performance tracking, metrics visualization, and coaching insights.

## Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint on .ts/.tsx files
npx tsc --noEmit    # Type-check without emitting files
```

## Architecture

### Tech Stack
- **Build Tool**: Vite 4.4.5 with React plugin
- **Framework**: React 18.2 with TypeScript 5.0
- **UI Components**: Custom React components with inline CSS-in-JS styling
- **Icons**: Lucide React for iconography
- **Data Processing**: Papa Parse for CSV handling

### Project Structure
- `/src/AgentPerformanceDashboard.tsx` - Main dashboard component (106KB, ~2700 lines)
- `/src/main.tsx` - React app entry point
- `/src/index.css` - Global styles
- Single-component architecture with all business logic self-contained

## Key Business Logic

### Performance Metrics Algorithm
The dashboard calculates complex performance scores:
- **Efficiency Score**: `(teamAvgHandleTime / agentAvgHandleTime) * 100`
- **Utilization Rate**: Based on total handle time vs available work hours
- **Productivity Rate**: `(handledInteractions / totalInteractions) * 100`
- **Versatility Score**: Coverage across different queues and media types

### Performance Tier Classification
Agents are automatically classified into tiers based on:
- Gold: Top 20% performers
- Silver: Next 30%
- Bronze: Remaining 50%

## Data Requirements

CSV uploads must contain these columns:
- `Queue` - Call queue identifier
- `Media Type` - Interaction type (voice, chat, email)
- `Abandoned` - YES/NO abandonment flag
- `Total Handle` - Handle time in seconds
- `Total Queue` - Queue time in seconds
- `Users - Interacted` - Agent identifier
- `Date` - Interaction timestamp

## Deployment

The project includes a `netlify.toml` configuration for Netlify deployment:
- Build command: `npm run build`
- Publish directory: `dist`
- Automatic SPA redirects configured
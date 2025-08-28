# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based agent performance dashboard for call center workforce analytics. The project consists of a single component that provides comprehensive agent performance tracking and visualization.

## Architecture

- **Single Component Structure**: The main functionality is contained in `agent-performance-dashboard.tsx`
- **React + TypeScript**: Uses modern React hooks (useState, useMemo, useEffect)
- **CSV Data Processing**: Uses Papa Parse library for handling uploaded CSV files
- **Self-contained Dashboard**: No external API dependencies, processes uploaded data client-side

## Key Dependencies

- React (hooks-based)
- Lucide React (icons)
- Papa Parse (CSV parsing)

## Data Structure

The dashboard expects CSV files with these key columns:
- `Queue`: Call queue identifier
- `Media Type`: Type of interaction (voice, chat, etc.)
- `Abandoned`: YES/NO flag
- `Total Handle`: Handle time in seconds
- `Total Queue`: Queue time in seconds  
- `Users - Interacted`: Agent identifier
- `Date`: Interaction date

## Key Features

- **Performance Metrics Calculation**: Efficiency scores, utilization rates, productivity metrics
- **Filtering**: By queue, media type, and individual agent
- **Sorting**: Multiple sort options for agent performance
- **Performance Tiers**: Gold/Silver/Bronze classification system
- **Coaching Insights**: Identifies agents needing additional support

## Performance Calculations

The component includes complex business logic for:
- Agent efficiency scoring (comparison to team average)
- Utilization rate calculations
- Productivity rate metrics
- Versatility scoring based on queue coverage
- Performance tier classification

## Development Notes

This appears to be a standalone component that could be integrated into a larger React application. The component is fully self-contained with no external state management or routing dependencies.
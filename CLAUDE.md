# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm start` - Start React development server
- `npm run build` - Build production bundle
- `npm run serve` - Run Express server
- `npm run dev` - Build and serve (production mode)
- `npm run lint` - Run ESLint linting
- `npx tsc --noEmit` - Check TypeScript types

## Code Style Guidelines
- **Imports**: Group imports by type: React, third-party libs, then local/relative
- **Formatting**: 2-space indentation, trailing commas
- **Types**: Always use TypeScript types for props, state, and function parameters
- **Components**: Use functional components with hooks
- **Error Handling**: Implement try/catch for async operations, provide clear error messages
- **CSS**: Use CSS Modules (*.module.css) for component styling
- **State Management**: Prefer React hooks (useState, useEffect, useContext)
- **Console Logging**: Remove debug console.logs before committing
- **Naming**: Use camelCase for variables/functions, PascalCase for components/types
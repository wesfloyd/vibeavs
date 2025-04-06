# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run/Test Commands
- Build: `npm run build`
- Start development server: `npm run dev`
- Lint: `npm run lint`
- Format code: `npm run format`
- Test all: `npm run test`
- Test single file: `npm run test -- path/to/file.test.js`

## Code Style Guidelines
- **Formatting**: Follow Prettier defaults; use semicolons; 2-space indentation
- **Imports**: Group imports (1. React/framework, 2. external libs, 3. internal modules)
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Types**: Use TypeScript for type safety; avoid `any` type when possible
- **Error Handling**: Use try/catch blocks for async operations; log errors appropriately
- **Components**: Prefer functional components with hooks over class components
- **State Management**: Use React Query for server state, Context API for shared state
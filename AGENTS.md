# Agent Guidelines for Grada

## Commands
- **Build**: `npm run build` or `next build`
- **Dev server**: `npm run dev` or `next dev`
- **Lint**: `npm run lint` or `eslint`
- **Start**: `npm run start` or `next start`
- **Test**: No test framework configured yet

## Code Style
- **Files**: Use `.js`/`.jsx` (not TypeScript)
- **Imports**: Use `@/` aliases (e.g., `@/components/ui/button`)
- **Components**: Function components with destructured props, default exports
- **Styling**: Tailwind CSS with Shadcn/ui "new-york" style
- **UI**: Radix UI primitives with class-variance-authority variants
- **Forms**: React Hook Form + Zod validation
- **Database**: Prisma with PostgreSQL
- **Async**: Use async/await consistently
- **Error handling**: Return null for not found cases, throw for errors
- **Naming**: camelCase for functions/variables, PascalCase for components
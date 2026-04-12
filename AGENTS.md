# Frontend Client Instructions

## Tech Stack (Important Notes for AI)

- **React 19** with React Compiler - DO NOT use `useMemo` or `useCallback` (compiler handles optimizations)
- **Tailwind CSS v4** - Latest syntax and features
- **TanStack Router** (file-based routing)
- **TanStack Query** (React Query)
- **TanStack Form** (If a form primitive doesnt exost make one)
- **Elysia Eden Treaty** (end-to-end type-safe API)
- **Better Auth**
- **DaisyUI** (powers themes)
- **shadcn/ui components**
- **Zod v4** (don't do z.string().email() do z.email()/z.url()), **Sonner**, **Lucide React**

## TanStack Start: import protection and server functions

- Import protection (Vite plugin, on by default) scans imports for TanStack Start's client and server targets and blocks or mocks cross-environment imports; scope is usually Start's `srcDirectory`.
- By default the client build denies resolved paths matching `**/*.server.*` and the specifier `@tanstack/react-start/server`; the server build denies `**/*.client.*`; `node_modules` resolved paths are skipped for file-pattern checks unless you change `excludeFiles`.
- Mark restricted modules with `import '@tanstack/react-start/server-only'` or `import '@tanstack/react-start/client-only'` when filenames do not use the `.server` / `.client` convention; never use both markers in one file.
- Default `behavior` is `mock` in dev (warn and substitute a safe Proxy) and `error` on production build; tune or disable via `tanstackStart({ importProtection })` in Vite (`include` / `exclude` / `ignoreImporters`, extra `client` / `server` deny rules, `onViolation`).
- The compiler can strip server-only imports used only inside `createServerFn().handler(...)`; if the same import is referenced outside that boundary, it stays in the client graph and import protection will still fire—split modules or use `createServerOnlyFn` / `createIsomorphicFn` instead of “leaky” helpers.
- Build-time checks run after tree-shaking, so dev-only warnings from barrels re-exporting `.server` files may be false positives; treat a failing build as the source of truth.
- Server functions are `createServerFn({ method? }).inputValidator(...).handler(async ({ data }) => ...)` from `@tanstack/react-start`; they run on the server but are callable from loaders, components (`useServerFn`), events, and other server functions with static imports preferred over dynamic `import()`.
- Organize with `*.functions.ts` for exported server functions (safe to import anywhere) and `*.server.ts` for DB and other helpers imported only inside handlers; keep shared schemas and types in plain `*.ts` files.
- Crossing the wire uses a single `data` payload—validate with Zod or other validators; handlers may throw errors, `redirect()`, or `notFound()` from TanStack Router.
- Request/response helpers (`getRequest`, `setResponseHeaders`, etc.) live in `@tanstack/react-start/server` and must only run in server contexts, consistent with import protection rules.

---

## ✅ DO

### Routing

- ✅ Create routes in folders with `index.tsx` file
- ✅ Put route-specific components in `-components` folder
  ```
  routes/
    dashboard/
      index.tsx
      -components/
        DashboardCard.tsx
  ```
- ✅ Put reusable/global components in `src/components/`
- ✅ Use `beforeLoad` for auth and role checks
- ✅ Throw `redirect()` for unauthorized access

### React Query

- ✅ Create `queryOptions` and use hooks directly in components

  ```typescript
  export const usersQueryOptions = queryOptions({
    queryKey: ["users"],
    queryFn: async () => treatyClient.users.get(),
  });

  // In component
  const query = useSuspenseQuery(usersQueryOptions);
  ```

- ✅ Use `useSuspenseQuery` for required data
- ✅ Handle mutations inline in components
- ✅ Exception: Auth/viewer logic can have custom hooks

### Styling

- ✅ Use shadcn components for UI elements
- ✅ Use DaisyUI for:
  - Theme utilities: `bg-base-100`, `bg-base-200`, `text-base-content`
  - Button classes: `btn`, `btn-primary`, `btn-ghost`, `btn-sm`
  - Card classes: `card`, `card-body`
  - Other theme-related utilities
- ✅ Use `twMerge` for className merging
- ✅ Add `data-test` attributes for testability

### Forms

- ✅ Use TanStack Form with custom field components
- ✅ Validate with Zod inline
  ```typescript
  <form.AppField
    name="email"
    validators={{ onChange: z.string().email() }}>
    {(field) => <field.TextField label="Email" />}
  </form.AppField>
  ```

### Code Organization

- ✅ Use path alias `@/` for imports
- ✅ Import types from `@backend/` for end-to-end type safety
- ✅ Keep route logic in route files
- ✅ Extract reusable logic to custom hooks
- ✅ Use `satisfies` operator for type checking

---

## ❌ DON'T

### React 19 with Compiler

- ❌ DON'T use `useMemo` - React Compiler handles it
- ❌ DON'T use `useCallback` - React Compiler handles it
- ❌ DON'T manually optimize unless profiling shows issues

### React Query

- ❌ DON'T create custom hooks for every query
- ❌ DON'T wrap `queryOptions` in custom hooks (except auth/viewer)
- ❌ DON'T over-abstract data fetching

### Routing

- ❌ DON'T put components directly in route file if they're reusable
- ❌ DON'T create route files without folder structure
- ❌ DON'T skip `beforeLoad` for protected routes
- ❌ DON'T create flat route structure - use folders with index files

### Styling

- ❌ DON'T mix DaisyUI components with shadcn (stick to shadcn for UI)
- ❌ DON'T use DaisyUI except for theme utilities and button classes or simple component taht can no seroius accessibility require,nets an dis standalone enough
- ❌ DON'T forget responsive design (`md:`, `lg:` prefixes)
- ❌ DON'T hardcode colors - use theme variables

### File Organization

- ❌ DON'T put route-specific components in global `components/` folder
- ❌ DON'T create components in route file itself - use `-components` folder
- ❌ DON'T forget to use path aliases (`@/`)

---

## Quick Reference

### Route Structure

```typescript
// routes/dashboard/index.tsx
export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  beforeLoad: async (context) => {
    if (!context.context.viewer?.user) {
      throw redirect({ to: "/auth", search: { returnTo: context.location.pathname } });
    }
  },
});

function DashboardPage() {
  const query = useSuspenseQuery(dataQueryOptions);
  return <div>...</div>;
}
```

### Query Pattern

```typescript
// Define queryOptions
export const itemsQueryOptions = queryOptions({
  queryKey: ["items"],
  queryFn: async () => {
    const { data, error } = await treatyClient.items.get();
    if (error) throw error;
    return data;
  },
});

// Use directly in component
const { data } = useSuspenseQuery(itemsQueryOptions);
```

### Mutation Pattern

```typescript
const mutation = useMutation({
  mutationFn: async (data) => treatyClient.items.post(data),
  onSuccess() {
    toast.success("Success!");
  },
  meta:{
    invalidates:[["items]]
  }
});
```

### Form Pattern

```typescript
const form = useAppForm({
  ...formOptions({ defaultValues: { name: "" } }),
  onSubmit: async ({ value }) => mutation.mutate(value),
});
```

### Styling Classes

```tsx
// DaisyUI theme utilities
<div className="bg-base-100 text-base-content">
  <button className="btn btn-primary">Action</button>
</div>

// shadcn components for everything else
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

---

## Common Mistakes to Avoid

1. Creating custom hooks for every React Query call
2. Using `useMemo`/`useCallback` with React 19 Compiler
3. Putting route components in wrong folders
4. Mixing DaisyUI components with shadcn (use shadcn for UI, DaisyUI for theme and simpler components that won't be nested in daisyui ones)
5. Forgetting `data-test` attributes
6. Not using `beforeLoad` for route protection
7. Creating routes without folder structure
8. Avoid casting to any or any types , request for permisson to do any such thig .Hiding type issues by casting t other pes is STRICTLY FORBIDDEN
9. Errors should be of type unknown in the catch block
   Do

```ts
    onSuccess() {
      toast.success("User removed");
      if (onSuccess) onSuccess(undefined);
    },
    onError(err: unknown) {
      toast.error("Failed to remove user", {
        description: unwrapUnknownError(err).message,
      });
    },
    meta: {
      invalidates: [["users"]],
    },
```

DON'T

```ts
    onSuccess() {
      toast.success("User removed");
      if (onSuccess) {
        onSuccess(undefined);
        qc.invalidatesQuery({queryKey:["users]
        })
        }
    },
    onError(err: any) {
      toast.error("Failed to create organization", { description: String(err?.message ?? err) });
    },
```

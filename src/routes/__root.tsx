import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className={`flex h-dvh dark:bg-slate-800 dark:text-slate-50`}>
      <Outlet />
    </div>
  ),
})
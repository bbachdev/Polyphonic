import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
        <div className={`flex h-dvh dark:bg-slate-800 dark:text-slate-50`}>
        <Outlet />
      </div>
    </QueryClientProvider>
  ),
})
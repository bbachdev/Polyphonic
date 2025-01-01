import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/initialsync')({
  component: InitialSync,
})

function InitialSync() {
  return (
    <>

    </>
  )
}
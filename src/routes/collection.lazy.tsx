import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/collection')({
  component: Collection,
})

function Collection() {
  return (
    <div className="p-2">
      Hello from Collection!
    </div>
  )
}
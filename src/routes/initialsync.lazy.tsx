import Spinner from '@/components/ui/spinner';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core';
import { load } from '@tauri-apps/plugin-store';
import { useEffect } from 'react'

export const Route = createLazyFileRoute('/initialsync')({
  component: InitialSync,
})

function InitialSync() {
  const navigate = useNavigate()

  useEffect(() => {
    async function sync() {
      let store = await load('config.json', { autoSave: false });
      const libraries: any = await store.get('libraries');
      await invoke('sync_collection', { libraries: libraries.value })
        .then(() => {
          console.log("Synced")
          navigate({ to: '/collection' })
        }).catch(() => {
          console.log("Failed to sync")
        })
    }
    sync();
  }, [])

  return (
    <main className={`w-full flex flex-col items-center justify-center h-dvh`}>
      <Spinner className={`mt-4`} size={96} />
      <h1 className={`mt-4 text-3xl font-bold`}>Syncing Your Collection</h1>
      <p className={`mt-4`}>This may take a bit...</p>
    </main>
  )
}
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
    <>

    </>
  )
}
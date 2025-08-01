import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core';
import { load } from '@tauri-apps/plugin-store';
import { useEffect } from 'react';

export const Route = createLazyFileRoute('/')({
  component: Startup,
})

function Startup() {
  const navigate = useNavigate()

  useEffect(() => {
    async function loadConfig() {
      const config = await load('config.json', { autoSave: false })
      const configKeys = await config.keys()
      console.log(configKeys)
      if (configKeys.length > 0) {
        //If Discord RP is enabled, start art server
        const discord_rp = await config.get<{value: boolean}>('discord_rp')
        if (discord_rp?.value === true) {
          await invoke('start_art_server')
        }

        navigate({ to: '/collection' })
      } else {
        navigate({ to: '/setup' })
      }
    }

    loadConfig()
  }, [])

  return (
    <div className="w-full h-dvh flex items-center justify-center">
      <img src='/tauri.svg' className={`h-40 w-40 animate-pulse`} />
    </div>
  )
}
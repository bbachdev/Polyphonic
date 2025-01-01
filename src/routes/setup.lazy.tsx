import SetupAdditional from '@/components/setup/SetupAdditional'
import SetupCollection from '@/components/setup/SetupCollection'
import SetupTheme from '@/components/setup/SetupTheme'
import SetupWelcome from '@/components/setup/SetupWelcome'
import { Config } from '@/types/Config'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { load } from '@tauri-apps/plugin-store'
import { useState } from 'react'

export const Route = createLazyFileRoute('/setup')({
  component: Setup,
})

function Setup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState<Partial<Config>>({})

  async function setupFinished(additional: Partial<Config>) {
    console.log("Additional", additional)
    setConfig({ ...config, ...additional })
    console.log(config)
    const store = await load('config.json', { autoSave: false });
    await store.set('theme', { value: config.theme });
    await store.set('libraries', { value: config.libraries });
    await store.set('discord_rp', { value: additional.discord_rp });
    await store.save();
    navigate({ to: '/initialsync' })
  }

  return (
    <div className={`mx-auto w-96 h-dvh flex flex-col items-center justify-center`}>
      {step === 0 && <SetupWelcome onNext={() => setStep(1)} />}
      {step === 1 && <SetupTheme setConfigTheme={(theme) => setConfig({ ...config, theme })} onNext={() => setStep(2)} />}
      {step === 2 && <SetupCollection configLibraries={config.libraries} setConfigLibraries={(libraries) => setConfig({ ...config, libraries })} onNext={() => setStep(3)} onPrevious={() => setStep(1)} />}
      {step === 3 && <SetupAdditional onFinish={(additional) => setupFinished(additional)} onPrevious={() => setStep(2)} />}
    </div>
  )
}
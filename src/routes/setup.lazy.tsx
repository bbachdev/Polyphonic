import SetupAdditional from '@/components/setup/SetupAdditional'
import SetupCollection from '@/components/setup/SetupCollection'
import SetupTheme from '@/components/setup/SetupTheme'
import SetupWelcome from '@/components/setup/SetupWelcome'
import { Config } from '@/types/Config'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createLazyFileRoute('/setup')({
  component: Setup,
})

function Setup() {
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState<Partial<Config>>({})

  function setupFinished() {
    console.log(config)
  }

  return (
    <div className={`mx-auto w-96 h-dvh flex flex-col items-center justify-center`}>
      {step === 0 && <SetupWelcome onNext={() => setStep(1)} />}
      {step === 1 && <SetupTheme setConfigTheme={(theme) => setConfig({ ...config, theme })} onNext={() => setStep(2)} />}
      {step === 2 && <SetupCollection configLibraries={config.libraries} setConfigLibraries={(libraries) => setConfig({ ...config, libraries })} onNext={() => setStep(3)} onPrevious={() => setStep(1)} />}
      {step === 3 && <SetupAdditional setConfigAdditional={(additional) => setConfig({ ...config, ...additional })} onFinish={setupFinished} onPrevious={() => setStep(2)} />}
    </div>
  )
}
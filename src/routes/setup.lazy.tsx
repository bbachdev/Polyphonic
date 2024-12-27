import SetupAdditional from '@/components/setup/SetupAdditional'
import SetupCollection from '@/components/setup/SetupCollection'
import SetupTheme from '@/components/setup/SetupTheme'
import SetupWelcome from '@/components/setup/SetupWelcome'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createLazyFileRoute('/setup')({
  component: Setup,
})

function Setup() {
  const [step, setStep] = useState(0)

  return (
    <div className={`w-full h-dvh flex flex-col items-center justify-center`}>
      {step === 0 && <SetupWelcome onNext={() => setStep(1)} />}
      {step === 1 && <SetupTheme onNext={() => setStep(2)} />}
      {step === 2 && <SetupCollection onNext={() => setStep(3)} onPrevious={() => setStep(1)} />}
      {step === 3 && <SetupAdditional onNext={() => setStep(4)} onPrevious={() => setStep(2)} />}
    </div>
  )
}
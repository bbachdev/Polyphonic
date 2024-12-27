import { Button } from '@/components/ui/button';

interface SetupWelcomeProps {
  onNext: () => void
}

export default function SetupWelcome({ onNext }: SetupWelcomeProps) {
  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Welcome to Polyphonic!</h1>
      <p className={`mt-2`}>{`Let's set up a few things first.`}</p>
      <Button className={`mt-4`} onClick={onNext}>Get Started</Button>
    </>
  )
}
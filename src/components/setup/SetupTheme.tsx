import { Button } from '../ui/button';

interface SetupWelcomeProps {
  onNext: () => void
}

export default function SetupTheme({ onNext }: SetupWelcomeProps) {
  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40 animate-pulse`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Select Your Theme</h1>
      <p className={`mt-2`}>{`Choose your theme from the options below:`}</p>
      <Button className={`mt-4`} onClick={onNext}>Get Started</Button>
    </>
  )
}
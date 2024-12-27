import { Button } from '../ui/button';

interface SetupThemeProps {
  onNext: () => void
}

export default function SetupTheme({ onNext }: SetupThemeProps) {
  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Select Your Theme</h1>
      <p className={`mt-2`}>{`Choose your theme from the options below:`}</p>
      <Button className={`mt-4`} onClick={onNext}>Next</Button>
    </>
  )
}
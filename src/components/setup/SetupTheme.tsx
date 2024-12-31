import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '../ui/button';
import { FaSun, FaMoon, FaCheck } from "react-icons/fa";

interface SetupThemeProps {
  setConfigTheme: (theme: string) => void
  onNext: () => void
}

export default function SetupTheme({ onNext, setConfigTheme }: SetupThemeProps) {
  const { theme, setTheme } = useTheme()

  function nextClicked() {
    setConfigTheme(theme)
    onNext()
  }

  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Select Your Theme</h1>
      <p className={`mt-2`}>{`Choose your theme from the options below:`}</p>
      <div className={`mt-4 w-2/3 flex flex-row gap-2`}>
        <Button variant='outline' className={`h-24 w-full flex flex-col`} onClick={() => setTheme('light')}>
          {theme === 'light' && <FaCheck className={`h-12 w-12`} /> || <FaSun className={`h-12 w-12`} />}
          <span>Light</span>
        </Button>
        <Button variant='outline' className={`h-24 w-full flex flex-col`} onClick={() => setTheme('dark')}>
          {theme === 'dark' && <FaCheck className={`h-12 w-12`} /> || <FaMoon className={`h-6 w-6`} />}
          <span>Dark</span>
        </Button>
      </div>
      <Button className={`mt-4 w-32`} onClick={nextClicked}>Next</Button>
    </>
  )
}
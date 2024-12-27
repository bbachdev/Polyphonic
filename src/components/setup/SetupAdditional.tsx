import { Button } from '../ui/button';

interface SetupAdditionalProps {
  onNext: () => void,
  onPrevious: () => void
}

export default function SetupAdditional({ onNext, onPrevious }: SetupAdditionalProps) {
  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Adjust Additional Settings</h1>
      <p className={`mt-2`}>{`Here are some other features you may wish to enable:`}</p>
      <Button className={`mt-4 w-32`} onClick={onNext}>Next</Button>
      <span className={`underline cursor-pointer mt-2`} onClick={onPrevious}>{`< Back`}</span>
    </>
  )
}
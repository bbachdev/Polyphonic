import { Button } from '../ui/button';

interface SetupCollectionProps {
  onNext: () => void,
  onPrevious: () => void
}

export default function SetupCollection({ onNext, onPrevious }: SetupCollectionProps) {
  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Add Your Collection</h1>
      <p className={`mt-2`}>{`Specify the place(s) where your music is located.`}</p>
      <Button className={`mt-4`} onClick={onNext}>Next</Button>
      <span className={`underline cursor-pointer`} onClick={onPrevious}>{`< Back`}</span>
    </>
  )
}
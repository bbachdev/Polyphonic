import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FaCloud } from "react-icons/fa";
import ServerConfigModal from '@/components/setup/ServerConfigModal';
import { useState } from 'react';
import { Library } from '@/types/Config';

interface SetupCollectionProps {
  configLibraries: Library[] | undefined,
  setConfigLibraries: (libraries: Library[]) => void,
  onNext: () => void,
  onPrevious: () => void
}

export default function SetupCollection({ configLibraries, setConfigLibraries, onNext, onPrevious }: SetupCollectionProps) {
  const [open, setOpen] = useState(false)
  const [libraries, setLibraries] = useState<Library[]>(configLibraries || [])

  function addLibrary(library: Library) {
    setLibraries([...libraries, library])
    setOpen(false)
  }

  function nextClicked() {
    setConfigLibraries(libraries)
    onNext()
  }

  return (
    <>
      <img src='/tauri.svg' className={`h-40 w-40`} />
      <h1 className={`mt-4 text-3xl font-bold`}>Add Your Collection</h1>
      <p className={`mt-2`}>{`Specify the place(s) where your music is located.`}</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={'outline'} className={`flex flex-row mt-4 h-20 text-left`}>
            <FaCloud className={`mr-2`} size={70} />
            <div className={`flex flex-col`}>
              <span>Add a Server Library</span>
              <span className={`mt-2`}>Connect to a Subsonic-compatible library</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <ServerConfigModal libraries={libraries} onClose={() => setOpen(false)} onConnectionSuccess={addLibrary} />
        </DialogContent>
      </Dialog>
      <Button disabled={libraries.length === 0} className={`mt-4 w-32`} onClick={nextClicked}>Next</Button>
      <span className={`underline cursor-pointer mt-2`} onClick={onPrevious}>{`< Back`}</span>
    </>
  )
}
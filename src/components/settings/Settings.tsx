import { Button } from '@/components/ui/button';
import { useLibraries } from '@/hooks/query/useLibraries';
import { resyncCollection } from '@/util/db';
import { useRouter } from '@tanstack/react-router';
import { invoke } from '@tauri-apps/api/core';
import { IoArrowBackCircleSharp } from "react-icons/io5";

interface SettingsProps {
  onBackClicked: () => void
}

export default function Settings({ onBackClicked }: SettingsProps) {
  const { navigate} = useRouter()
  const { data: libraries } = useLibraries()

  async function resync() {
    resyncCollection()
    //Delete local album art
    await invoke('clear_cover_art_cache')

    navigate({ to: '/initialsync' })
  }

  return (
    <div className={`w-full flex flex-col`}>
      <div className={`flex flex-row p-4 items-center border-b-2 border-slate-800 dark:border-slate-200`}>
        <button className={`flex flex-row items-center gap-2`} onClick={onBackClicked}>
          <IoArrowBackCircleSharp size={40} /> <span className={`text-xl`}>Back</span>
        </button>
      </div>
      <div className={`p-4`}>
        <h1 className={`text-3xl`}>Settings</h1>
        <div className={`mt-8 flex flex-col gap-2`}>
          <span className={`text-xl border-b-2 border-slate-800 dark:border-slate-200 w-fit`}>Libraries</span>
          { libraries && libraries.size > 0 && (
            <div className={`flex flex-col`}>
              { Array.from(libraries.values()).map((library) => (
                <div className={`flex flex-col`} key={library.id}>
                  <span className={`text-xl`}>{library.name}</span>
                  <span className={`text-sm`}>{`${library.username} - ${library.host}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`mt-8 flex flex-col gap-2`}>
          <span className={`text-xl border-b-2 border-slate-800 dark:border-slate-200 w-fit`}>Re-Sync Collection</span>
          <span className={`text-sm`}>{`If you wish to re-sync your collection, click the button below.`}</span>
          <span className={`text-sm italic`}>{`(Note: This will remove all local data, including tags and cached cover art)`}</span>
          <Button className={`mt-2 bg-slate-800 hover:bg-slate-600 dark:bg-slate-200 dark:hover:bg-slate-400 text-white dark:text-black rounded-md p-2 w-fit`} onClick={resync}>Re-Sync</Button>
        </div>
      </div>
    </div>
  )
}
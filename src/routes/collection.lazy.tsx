import AlbumList from '@/components/collection/AlbumList';
import ArtistList from '@/components/collection/ArtistList';
import SongList from '@/components/collection/SongList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { createLazyFileRoute } from '@tanstack/react-router'
import { FaGear } from "react-icons/fa6";

export const Route = createLazyFileRoute('/collection')({
  component: Collection,
})

function Collection() {
  return (
    <div className={`w-full flex flex-col`}>
      <div className={`flex flex-row p-4 items-center border-b-2 border-slate-800 dark:border-slate-200`}>
        <div>
          <img src='/tauri.svg' className={`h-10 w-10`} />
        </div>
        <div className={`ml-auto`}>
          <button><FaGear className={`h-8 w-8`} /></button>
        </div>
      </div>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={20} minSize={15}>
          <ArtistList />
        </ResizablePanel>
        <ResizableHandle className={`dark:bg-slate-200`} />
        <ResizablePanel defaultSize={60} minSize={30}>
          <AlbumList />
        </ResizablePanel>
        <ResizableHandle className={`dark:bg-slate-200`} />
        <ResizablePanel defaultSize={20} minSize={20}>
          <SongList />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
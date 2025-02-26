import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import QueueContext from '@/contexts/QueueContext';
import { useContext } from 'react';
import { PiQueueFill } from 'react-icons/pi';

import {DndContext, DragEndEvent} from '@dnd-kit/core';
import {restrictToVerticalAxis, restrictToWindowEdges} from '@dnd-kit/modifiers';
import {SortableContext, verticalListSortingStrategy, arrayMove} from '@dnd-kit/sortable';
import { Song } from '@/types/Music';
import QueueItem from '@/components/collection/QueueItem';

interface QueueListProps {
  nowPlayingId: string | undefined
  onPlaySong: (song: Song, index: number) => void
}

export default function QueueList( { nowPlayingId, onPlaySong }: QueueListProps) {
  const { queue, setQueue, setCurrentSong } = useContext(QueueContext)

  function reorderQueue(event: DragEndEvent) {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      let activeIndex = queue.findIndex((song) => song.id === active.id)
      let overIndex = queue.findIndex((song) => song.id === over.id)
      setQueue(arrayMove(queue, activeIndex,overIndex));
      //If song id matches now playing, update current song
      if(nowPlayingId === active.id) {
        setCurrentSong(overIndex)
      }
    }
  }

  function onSongSelected(song: Song) {
    let songIndex = queue.findIndex((s) => s.id === song.id)
    setCurrentSong(songIndex)
    onPlaySong(song, songIndex)
  }

  function removeFromQueue(songId: string) {
    setQueue(queue.filter((song) => song.id !== songId))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <PiQueueFill className={`p-2 dark:hover:text-slate-200`} size={48} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        { queue && queue.length > 0 && (
          <ScrollArea className={`w-96 h-[36rem]`}>
            <DndContext onDragEnd={reorderQueue} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
              <SortableContext items={queue} strategy={verticalListSortingStrategy}>
                <div className={`flex flex-col`}>
                  {queue.map((song) => {
                    return (
                      <QueueItem key={song.id} song={song} nowPlayingId={nowPlayingId} onSongSelected={onSongSelected} onRemoveSelected={removeFromQueue} />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
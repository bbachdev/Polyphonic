import { ScrollArea } from '@/components/ui/scroll-area';
import { Queue } from '@/types/Music';
import QueueItem from '@/components/collection/QueueItem';
import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BiSolidPlaylist } from 'react-icons/bi';

import {restrictToVerticalAxis, restrictToWindowEdges} from '@dnd-kit/modifiers';
import {DndContext, DragEndEvent} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';

interface QueueListProps {
  queue: Queue | undefined
  onQueueItemClick: (queue_index: number) => void
  onQueueChange: (queue: Queue) => void
}

export default function QueueList({ queue, onQueueItemClick }: QueueListProps) {
  const [queueState, setQueueState] = useState<Queue | undefined>(undefined)

  useEffect(() => {
    setQueueState(queue)
  }, [queue])

  // function queueAdjusted(queue: Queue) {
  //   if (queue.current_song === queue.songs.length - 1) {
  //     return { ...queue, current_song: 0 }
  //   } else {
  //     return { ...queue, current_song: queue.current_song + 1 }
  //   }
  // }

  function reorderQueue(e: DragEndEvent) {
    //TODO: Stop this from reording SongList (I'm assuming they're tied together currently)

    // if(!e.over) return

    // if(e.active.id !== e.over.id) {
      
    //   if(!queueState) return
    //   let newQueue = queueState
    //   const fromIndex = newQueue.songs.findIndex(song => song.id === e.active.id)
    //   const toIndex = newQueue.songs.findIndex(song => song.id === e.over!.id)
    //   if(newQueue.songs[newQueue.current_song].id === e.active.id) {
    //     newQueue.current_song = toIndex
    //   }
    //   const [movedSong] = newQueue.songs.splice(fromIndex, 1)
    //   newQueue.songs.splice(toIndex, 0, movedSong)

    //   setQueueState(newQueue)
      
    //   // setQueueState((prevQueue) => {
    //   //   if(!prevQueue) return
    //   //   const newQueue = [...prevQueue]
    //   //   const fromIndex = prevQueue.findIndex(song => song.id === e.active.id)
    //   //   const toIndex = prevQueue.findIndex(song => song.id === e.over!.id)
    //   //   const [movedSong] = newQueue.splice(fromIndex, 1)
    //   //   newQueue.splice(toIndex, 0, movedSong)
    //   //   return newQueue
    //   // })
    // }
  }

  function deleteQueueItem(index: number) {
    if (queueState) {
      setQueueState({ ...queueState, songs: queueState.songs.filter((_s, i) => i !== index) })
    }
  }

  return (
    <>
      {queueState && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <button>
              <BiSolidPlaylist className={`h-8 w-8`} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <ScrollArea className={`w-96 h-[36rem] overflow-hidden flex flex-col`}>
              <DndContext onDragEnd={reorderQueue} modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}>
                <SortableContext items={queueState.songs} strategy={verticalListSortingStrategy}>
                  {queueState.songs.map((song, index) => (
                    <QueueItem key={song.id} index={index} song={song} current_index={queueState.current_song} onQueueItemClick={() => onQueueItemClick(index)} onQueueItemDelete={deleteQueueItem} />
                  ))}
                </SortableContext>
              </DndContext>
            </ScrollArea>
          </DropdownMenuContent> 
        </DropdownMenu>
      )}
    </> 
  )
}
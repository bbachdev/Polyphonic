import { ScrollArea } from '@/components/ui/scroll-area';
import { Queue } from '@/types/Music';
import QueueItem from '@/components/collection/QueueItem';
import { useEffect, useState } from 'react';

interface QueueListProps {
  queue: Queue | undefined
  onQueueItemClick: (queue_index: number) => void
  // onQueueChange: (queue: Queue) => void
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

  function deleteQueueItem(index: number) {
    if (queueState) {
      setQueueState({ ...queueState, songs: queueState.songs.filter((_s, i) => i !== index) })
    }
  }

  return (
    <div className={`flex flex-col`}>
      <ScrollArea className={`w-full`}></ScrollArea>
      {queueState && queueState.songs.length > 0 && (
        <>
          {queueState.songs.map((song, index) => (
            <QueueItem key={index} index={index} song={song} current_index={queueState.current_song} onQueueItemClick={() => onQueueItemClick(index)} onQueueItemDelete={deleteQueueItem} />
          ))}
        </>
      )}
    </div>
  )
}
import { Song } from '@/types/Music';
import { createContext, useState } from 'react';

const QueueContext = createContext<QueueContextType>({
  queue: [],
  currentSong: undefined,
  queueOrigin: undefined,
  setQueue: () => {},
  setCurrentSong: () => {},
  setQueueOrigin: () => {},
  addToQueue: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
})

interface QueueContextType {
  queue: Song[],
  currentSong: number | undefined
  queueOrigin: number | undefined
  setQueueOrigin: (origin: number | undefined) => void,
  setQueue: (queue: Song[]) => void
  setCurrentSong: (song: number | undefined) => void
  addToQueue: (song: Song) => void
  removeFromQueue: (song: Song) => void
  clearQueue: () => void
}

export default QueueContext

export const QueueContextProvider = ({children}: any) => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<number | undefined>();
  const [queueOrigin, setQueueOrigin] = useState<number | undefined>();

  const addToQueue = (song: Song) => {
    setQueue([...queue, song]);
  };

  const removeFromQueue = (song: Song) => {
    setQueue(queue.filter((s) => s !== song));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <QueueContext.Provider value={{queue, currentSong, queueOrigin, setQueue, setCurrentSong, setQueueOrigin, addToQueue, removeFromQueue, clearQueue}}>
      {children}
    </QueueContext.Provider>
  );
}
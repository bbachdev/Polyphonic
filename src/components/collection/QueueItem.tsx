import { Song } from '@/types/Music'
import { MdDeleteForever, MdDragIndicator } from "react-icons/md";
import { CgLoadbarSound } from 'react-icons/cg'
import CoverArt from '@/components/collection/CoverArt';

import { useSortable } from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities';

interface QueueItemProps {
  song: Song,
  index: number,
  current_index: number,
  onQueueItemClick: (songId: string) => void
  onQueueItemDelete: (index: number) => void
}

export default function QueueItem({ song, index, current_index, onQueueItemClick, onQueueItemDelete }: QueueItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song.id })
  const style = {transform: CSS.Transform.toString(transform), transition};

  return (
    <div className={`w-full p-2 cursor-pointer flex flex-row items-center ${index === current_index ? 'dark:bg-slate-700' : ''} dark:hover:bg-slate-700`} ref={setNodeRef} style={style}>
      <button className={`px-2 cursor-pointer flex items-center hover:text-slate-200`} {...listeners} {...attributes}>
        <MdDragIndicator size={24} className={`mr-auto self-center`} />
      </button>
      <button className={`w-full flex flex-row items-center`} key={index} onClick={() =>onQueueItemClick(song.id)}>
        <CoverArt src={song.cover_art + '.png'} fallbackSrc={song.cover_art + '.jpg'} alt={song.title} className={`h-12 w-12`} />
        <div className={`flex flex-col text-left`}>
          <p className={`px-1 font-semibold text-base line-clamp-1 break-all`}>{song.title}</p>
          <p className={`mt-1 px-1 text-xs dark:text-slate-200/90 line-clamp-1 break-all`}>{song.artist_name}</p>
        </div>
        <div className={`ml-auto`}>
          { index == current_index && <CgLoadbarSound className={`h-6 w-6`} /> }
          { index !== current_index && <MdDeleteForever className={`h-6 w-6`} onClick={() => onQueueItemDelete(index)} /> }
        </div>
      </button>
    </div>
    
  )
}